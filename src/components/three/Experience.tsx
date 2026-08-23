"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { Room } from "./Room";
import { ResponsiveCameraRig } from "./ResponsiveCameraRig";
import { useBookStore } from "@/store/useBookStore";
import { SCENE_THEMES } from "@/lib/sceneTheme";

export function Experience() {
  const theme = useBookStore((s) => s.theme);
  const colors = SCENE_THEMES[theme];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.3, 4.4], fov: 32 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[colors.background]} />
      <ResponsiveCameraRig />
      <Suspense fallback={null}>
        <Room />
        <Book />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={true}
        minDistance={2.6}
        maxDistance={8}
        minPolarAngle={Math.PI / 2 - 0.55}
        maxPolarAngle={Math.PI / 2 + 0.25}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        dampingFactor={0.08}
        target={[0, 0.75, 0]}
      />
    </Canvas>
  );
}
