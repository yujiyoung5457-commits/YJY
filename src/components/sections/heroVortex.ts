type VortexRenderer = {
  render: (progress: number) => void;
  dispose: () => void;
};

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform vec2 u_imageResolution;
  uniform float u_progress;

  vec2 coverUv(vec2 uv) {
    float viewportAspect = u_resolution.x / u_resolution.y;
    float imageAspect = u_imageResolution.x / u_imageResolution.y;
    vec2 visibleArea = vec2(1.0);

    if (viewportAspect > imageAspect) {
      visibleArea.y = imageAspect / viewportAspect;
    } else {
      visibleArea.x = viewportAspect / imageAspect;
    }

    return (uv - 0.5) * visibleArea + 0.5;
  }

  void main() {
    float progress = smoothstep(0.0, 1.0, u_progress);
    float aspect = u_resolution.x / u_resolution.y;
    vec2 centered = v_uv - 0.5;
    centered.x *= aspect;

    float radius = length(centered);
    float angle = atan(centered.y, centered.x);
    float vortexFalloff = 1.0 - smoothstep(0.05, 1.05, radius);
    float twist = progress * (2.0 + 10.0 * vortexFalloff);
    float collapse = mix(1.0, 0.055, pow(progress, 1.3));
    float pulledRadius = radius / collapse;

    angle += twist;
    vec2 pulled = vec2(cos(angle), sin(angle)) * pulledRadius;
    pulled.x /= aspect;

    vec2 textureUv = coverUv(pulled + 0.5);
    float outside = max(
      max(-textureUv.x, textureUv.x - 1.0),
      max(-textureUv.y, textureUv.y - 1.0)
    );
    float imageMask = 1.0 - smoothstep(0.0, 0.025, outside);
    vec3 imageColor = texture2D(u_texture, clamp(textureUv, 0.0, 1.0)).rgb;

    float luminance = dot(imageColor, vec3(0.2126, 0.7152, 0.0722));
    imageColor = mix(vec3(luminance), imageColor, 1.14);
    imageColor = (imageColor - 0.5) * 1.025 + 0.5;

    gl_FragColor = vec4(imageColor, imageMask);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function createHeroVortex(
  canvas: HTMLCanvasElement,
  imageSource: string,
): VortexRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });

  if (!gl) return null;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();

  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const progressLocation = gl.getUniformLocation(program, "u_progress");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const imageResolutionLocation = gl.getUniformLocation(program, "u_imageResolution");
  const textureLocation = gl.getUniformLocation(program, "u_texture");
  const positionBuffer = gl.createBuffer();
  const texture = gl.createTexture();

  if (!positionBuffer || !texture) return null;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(textureLocation, 0);

  let imageWidth = 1;
  let imageHeight = 1;
  let textureReady = false;
  let latestProgress = 0;
  let disposed = false;

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const render = (progress: number) => {
    latestProgress = Math.min(1, Math.max(0, progress));
    if (!textureReady || disposed) return;

    resize();
    gl.useProgram(program);
    gl.uniform1f(progressLocation, latestProgress);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(imageResolutionLocation, imageWidth, imageHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const image = new window.Image();
  image.decoding = "async";
  image.addEventListener("load", () => {
    if (disposed) return;

    imageWidth = image.naturalWidth;
    imageHeight = image.naturalHeight;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    );
    textureReady = true;
    render(latestProgress);
  });
  image.src = imageSource;

  return {
    render,
    dispose: () => {
      disposed = true;
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    },
  };
}
