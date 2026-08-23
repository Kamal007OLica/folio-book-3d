"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { PAGE_HEIGHT } from "./pageGeometry";
import { SPINE_TEXTURE, PAGE_COUNT } from "@/lib/pages-data";

export function Spine({ totalThickness, page }: { totalThickness: number; page: number }) {
  const texture = useTexture(SPINE_TEXTURE);
  // eslint-disable-next-line react-hooks/immutability -- imperative three.js texture config, not React state
  texture.colorSpace = THREE.SRGBColorSpace;

  const half = totalThickness / 2;
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(1);

  const blockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d8481f",
        roughness: 0.55,
        metalness: 0.05,
        transparent: true,
      }),
    []
  );
  const faceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.6,
        side: THREE.DoubleSide,
      }),
    [texture]
  );

  // The spine only makes sense as the book's closed silhouette — sitting
  // between two open pages while reading looks like a solid block cutting
  // the spread in half and throwing an intrusive shadow across it. Fade it
  // out (and stop it casting a shadow) whenever both stacks have content.
  // eslint-disable-next-line react-hooks/immutability -- imperative three.js material/object3D updates, not React state
  useFrame((_, delta) => {
    const isClosed = page <= 0 || page >= PAGE_COUNT;
    const target = isClosed ? 1 : 0;
    opacityRef.current = THREE.MathUtils.damp(opacityRef.current, target, 6, delta);
    // eslint-disable-next-line react-hooks/immutability -- imperative three.js material update, not React state
    blockMaterial.opacity = opacityRef.current;
    // eslint-disable-next-line react-hooks/immutability -- imperative three.js material update, not React state
    faceMaterial.opacity = opacityRef.current;
    const visible = opacityRef.current > 0.02;
    if (groupRef.current) groupRef.current.visible = visible;
  });

  return (
    <group ref={groupRef}>
      {/* solid binding block */}
      <mesh position={[-0.055, 0, -half]} material={blockMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.11, PAGE_HEIGHT * 1.015, totalThickness + 0.015]} />
      </mesh>
      {/* printed spine face */}
      <mesh
        position={[-0.112, 0, -half]}
        rotation={[0, -Math.PI / 2, 0]}
        material={faceMaterial}
      >
        <planeGeometry args={[totalThickness + 0.02, PAGE_HEIGHT * 0.99]} />
      </mesh>
    </group>
  );
}
