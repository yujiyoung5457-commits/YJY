"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const TURN_DURATION_SECONDS = 2.5;
const MAX_PIXEL_RATIO = 2;

type SceneProps = {
  modelPath?: string;
  maintainZoomQuality?: boolean;
  contain?: boolean;
};

export function Scene({
  modelPath = "/POLTFOLIO3D.glb",
  maintainZoomQuality = false,
  contain = false,
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1d366d, 2.4));

    const keyLight = new THREE.DirectionalLight(0xffd6a0, 4.8);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x5ecbff, 3.2);
    fillLight.position.set(-5, 1.5, 4);
    scene.add(fillLight);

    const turntable = new THREE.Group();
    scene.add(turntable);

    let model: THREE.Object3D | undefined;
    let fitModelToView = () => {};
    let disposed = false;

    new GLTFLoader().load(modelPath, (gltf) => {
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

        materials.forEach((material) => {
          material.side = THREE.DoubleSide;
          if (material.transparent || material.opacity < 1) {
            material.depthWrite = false;
            material.needsUpdate = true;
          }
        });
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
            0.82;

          model.position.copy(center).multiplyScalar(-scale);
          model.scale.setScalar(scale);
        };
        fitModelToView();
      } else {
        const scale = 3.5 / (Math.max(size.x, size.y, size.z) || 1);
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

    let frameId = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      const parentStyle = canvas.parentElement?.style;
      const parentOpacity = Number.parseFloat(parentStyle?.opacity || "1");
      const layerIsVisible =
        parentStyle?.visibility !== "hidden" && parentOpacity > 0.01;

      if (isInViewport && !document.hidden && layerIsVisible) {
        turntable.rotation.y =
          ((now - startTime) / 1000 / TURN_DURATION_SECONDS) * Math.PI * 2;
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
      window.removeEventListener("hero-model-zoom", handleHeroZoom);

      model?.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => material.dispose());
      });

      renderer.dispose();
    };
  }, [contain, maintainZoomQuality, modelPath]);

  return <canvas ref={canvasRef} aria-label="Rotating 3D portfolio model" />;
}
