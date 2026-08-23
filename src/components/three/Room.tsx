"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useBookStore } from "@/store/useBookStore";
import { SCENE_THEMES } from "@/lib/sceneTheme";

export function Room() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const page = useBookStore((s) => s.page);
  const theme = useBookStore((s) => s.theme);
  const colors = SCENE_THEMES[theme];
  const swayTarget = useRef(0);

  useFrame((_, delta) => {
    swayTarget.current = THREE.MathUtils.damp(swayTarget.current, page * 0.004, 3, delta);
    if (keyLightRef.current) {
      keyLightRef.current.position.x = 1.8 + swayTarget.current;
    }
  });

  return (
    <>
      <ambientLight intensity={colors.ambientIntensity} color={colors.ambientColor} />

      <directionalLight
        ref={keyLightRef}
        position={[1.8, 2.6, 2.2]}
        intensity={1.9}
        color="#fff2e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-2, 2, 2, -2, 0.1, 10]} />
      </directionalLight>

      <directionalLight position={[-2.4, 1.2, 1.6]} intensity={0.45} color="#8fb8ff" />

      <directionalLight position={[-0.6, 2.2, -2.4]} intensity={0.6} color="#ffb27a" />

      {/* Low bounce light: without it the dark lower half of the cover
          artwork reads as pure black against the black backdrop and looks
          like it's been cropped off — this keeps it visibly distinct. */}
      <pointLight position={[0.3, 0.35, 2.6]} intensity={0.5} color="#ffd9b0" distance={5} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={colors.floor} roughness={0.95} />
      </mesh>

      <ContactShadows
        position={[0, -0.015, 0]}
        opacity={0.55}
        scale={6}
        blur={2.4}
        far={2}
        resolution={512}
        color="#000000"
      />

      <fog attach="fog" args={[colors.fog, colors.fogNear, colors.fogFar]} />
    </>
  );
}
