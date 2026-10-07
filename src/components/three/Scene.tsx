"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const TURN_DURATION_SECONDS = 2.5;
const MAX_PIXEL_RATIO = 2;
const STUDIO_LIGHTING = {
  exposure: 1.0,

  hemisphereSky: 0xfff7ee,
  hemisphereGround: 0x4a3a34,
  hemisphereIntensity: 0.58,

  keyColor: 0xfff0dc,
  keyIntensity: 1.25,

  fillColor: 0xffffff,
  fillIntensity: 0.5,

  environmentIntensity: 0.42,
};
type ModelMotion = "none" | "bounce";

type SceneProps = {
  modelPath?: string;
  maintainZoomQuality?: boolean;
  contain?: boolean;
  autoRotate?: boolean;
  initialRotationY?: number;
  preserveMaterialSettings?: boolean;
  studioLighting?: boolean;
  draggable?: boolean;
  turnDurationSeconds?: number;
  modelScale?: number;
  motion?: ModelMotion;
};

export function Scene({
  modelPath = "/POLTFOLIO3D.glb",
  maintainZoomQuality = false,
  contain = false,
  autoRotate = true,
  initialRotationY = 0,
  preserveMaterialSettings = false,
  studioLighting = false,
  draggable = false,
  turnDurationSeconds = TURN_DURATION_SECONDS,
  modelScale = 1,
  motion = "none",
}: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.15, 5.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 1.5,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = studioLighting
      ? THREE.NeutralToneMapping
      : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = studioLighting
      ? STUDIO_LIGHTING.exposure
      : 1.25;

    scene.add(
      new THREE.HemisphereLight(
        studioLighting ? STUDIO_LIGHTING.hemisphereSky : 0xffffff,
        studioLighting ? STUDIO_LIGHTING.hemisphereGround : 0x1d366d,
        studioLighting ? STUDIO_LIGHTING.hemisphereIntensity : 2.4,
      ),
    );

    const keyLight = new THREE.DirectionalLight(
      studioLighting ? STUDIO_LIGHTING.keyColor : 0xffd6a0,
      studioLighting ? STUDIO_LIGHTING.keyIntensity : 4.8,
    );
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      studioLighting ? STUDIO_LIGHTING.fillColor : 0x5ecbff,
      studioLighting ? STUDIO_LIGHTING.fillIntensity : 3.2,
    );
    fillLight.position.set(-5, 1.5, 4);
    scene.add(fillLight);

    let environmentRenderTarget: THREE.WebGLRenderTarget | undefined;
    if (studioLighting) {
      const roomEnvironment = new RoomEnvironment();
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      environmentRenderTarget = pmremGenerator.fromScene(roomEnvironment);
      scene.environment = environmentRenderTarget.texture;
      scene.environmentIntensity = STUDIO_LIGHTING.environmentIntensity;

      roomEnvironment.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => material.dispose());
      });
      pmremGenerator.dispose();
    }

    const turntable = new THREE.Group();
    scene.add(turntable);

    let model: THREE.Object3D | undefined;
    let fitModelToView = () => {};
    let disposed = false;

    const dracoLoader = new DRACOLoader();
    const loader = new GLTFLoader()
      .setDRACOLoader(dracoLoader)
      .setMeshoptDecoder(MeshoptDecoder);

    loader.load(modelPath, (gltf) => {
      if (disposed) {
        gltf.scene.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((material) => material.dispose());
        });
        return;
      }

      model = gltf.scene;
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        if (!preserveMaterialSettings) {
          materials.forEach((material) => {
            material.side = THREE.DoubleSide;
            if (material.transparent || material.opacity < 1) {
              material.depthWrite = false;
              material.needsUpdate = true;
            }
          });
        }
      });

      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());

      if (contain) {
        fitModelToView = () => {
          if (!model) return;

          const verticalFov = THREE.MathUtils.degToRad(camera.fov);
          const visibleHeight = 2 * Math.tan(verticalFov / 2) * camera.position.z;
          const visibleWidth = visibleHeight * camera.aspect;
          const horizontalSize = Math.max(size.x, size.z) || 1;
          const scale =
            Math.min(visibleWidth / horizontalSize, visibleHeight / (size.y || 1)) *
            0.82 *
            modelScale;

          model.position.copy(center).multiplyScalar(-scale);
          model.scale.setScalar(scale);
        };
        fitModelToView();
      } else {
        const scale =
          (3.5 / (Math.max(size.x, size.y, size.z) || 1)) * modelScale;
        model.position.copy(center).multiplyScalar(-scale);
        model.scale.setScalar(scale);
      }

      turntable.add(model);
    });

    const basePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    let zoomQuality = 1;
    let appliedPixelRatio = 0;
    let renderedWidth = 0;
    let renderedHeight = 0;

    const resize = (force = false) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      const pixelRatio = Math.min(basePixelRatio * zoomQuality, MAX_PIXEL_RATIO);
      const sizeChanged = width !== renderedWidth || height !== renderedHeight;
      const ratioChanged = Math.abs(pixelRatio - appliedPixelRatio) > 0.08;

      if (!force && !sizeChanged && !ratioChanged) return;

      if (sizeChanged || force) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        fitModelToView();
        renderedWidth = width;
        renderedHeight = height;
      }

      if (ratioChanged || force) {
        renderer.setPixelRatio(pixelRatio);
        appliedPixelRatio = pixelRatio;
      }

      renderer.setSize(width, height, false);
    };

    const handleHeroZoom = (event: Event) => {
      if (!maintainZoomQuality) return;

      const scale = Math.max(1, (event as CustomEvent<number>).detail || 1);
      const nextZoomQuality = 1 + Math.min(Math.log2(scale), 3) * 0.08;

      if (Math.abs(nextZoomQuality - zoomQuality) < 0.04) return;
      zoomQuality = nextZoomQuality;
      resize();
    };

    window.addEventListener("hero-model-zoom", handleHeroZoom);

    const resizeObserver = new ResizeObserver(() => resize(true));
    resizeObserver.observe(canvas);
    resize(true);

    let isInViewport = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    intersectionObserver.observe(canvas);

    let activePointerId: number | null = null;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragRotationX = 0;
    let dragRotationY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (!draggable) return;
      activePointerId = event.pointerId;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggable || activePointerId !== event.pointerId) return;

      dragRotationY += (event.clientX - lastPointerX) * 0.01;
      dragRotationX = THREE.MathUtils.clamp(
        dragRotationX + (event.clientY - lastPointerY) * 0.006,
        -0.35,
        0.35,
      );
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      canvas.style.cursor = draggable ? "grab" : "";
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerEnd);
    canvas.addEventListener("pointercancel", handlePointerEnd);

    let frameId = 0;
    const startTime = performance.now();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const render = (now: number) => {
      const parentStyle = canvas.parentElement?.style;
      const parentOpacity = Number.parseFloat(parentStyle?.opacity || "1");
      const layerIsVisible =
        parentStyle?.visibility !== "hidden" && parentOpacity > 0.01;

      if (isInViewport && !document.hidden && layerIsVisible) {
        const elapsedSeconds = (now - startTime) / 1000;
        const rotationDuration = Math.max(turnDurationSeconds, 0.1);
        turntable.rotation.y = autoRotate
          ? initialRotationY +
            (elapsedSeconds / rotationDuration) * Math.PI * 2 +
            dragRotationY
          : initialRotationY + dragRotationY;
        turntable.rotation.x = dragRotationX;

        if (motion === "bounce" && !reducedMotion) {
          const bouncePhase = (elapsedSeconds / 1.35) * Math.PI * 2;
          turntable.position.y = Math.max(0, Math.sin(bouncePhase)) * 0.2;
          turntable.rotation.z = Math.sin(bouncePhase) * 0.025;
        } else {
          turntable.position.y = 0;
          turntable.rotation.z = 0;
        }

        renderer.render(scene, camera);
      }

      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerEnd);
      canvas.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("hero-model-zoom", handleHeroZoom);

      model?.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => material.dispose());
      });

      dracoLoader.dispose();
      environmentRenderTarget?.dispose();
      renderer.dispose();
    };
  }, [
    autoRotate,
    contain,
    draggable,
    initialRotationY,
    maintainZoomQuality,
    modelScale,
    modelPath,
    motion,
    preserveMaterialSettings,
    studioLighting,
    turnDurationSeconds,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={
        draggable
          ? "Draggable 3D portfolio model"
          : autoRotate
            ? "Rotating 3D portfolio model"
            : "3D portfolio model"
      }
      style={draggable ? { cursor: "grab", touchAction: "none" } : undefined}
    />
  );
}
