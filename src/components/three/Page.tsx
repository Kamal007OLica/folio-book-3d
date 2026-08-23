"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  PAGE_HEIGHT,
  PAGE_THICKNESS,
  PAGE_WIDTH,
  applyBend,
  createBoneChain,
  getPageBackGeometry,
  getPageGeometry,
} from "./pageGeometry";
import { dragState } from "@/lib/dragState";
import { TOTAL_STOPS } from "@/store/useBookStore";
import { soundEngine } from "@/lib/audio/soundEngine";
import { PAGE_COUNT } from "@/lib/pages-data";

/**
 * A leaf's z-depth slot must flip once it crosses the spine (progress 0.5,
 * where it's edge-on to the camera and the swap is invisible) — otherwise
 * leaves that have turned to the left stack stay buried behind leaves still
 * resting on the right, and the back cover never surfaces at the end.
 */
function depthForLeaf(leafIndex: number, progress: number) {
  const rank = progress < 0.5 ? leafIndex : PAGE_COUNT - 1 - leafIndex;
  return -rank * PAGE_THICKNESS;
}

interface PageProps {
  leafIndex: number;
  frontUrl: string;
  backUrl: string;
  page: number;
  isCover?: boolean;
  onStartDrag: (leafIndex: number, clientX: number) => void;
}

export function Page({ leafIndex, frontUrl, backUrl, page, isCover, onStartDrag }: PageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bones = useMemo(() => createBoneChain(), []);
  const skeleton = useMemo(() => {
    // Bones aren't in a mounted scene graph yet, so matrixWorld is still
    // identity for all of them; force it up to date first or Skeleton's
    // bind-pose inverses come out wrong (double-transforms the chain).
    bones[0].updateMatrixWorld(true);
    return new THREE.Skeleton(bones);
  }, [bones]);
  const progressRef = useRef(leafIndex < page ? 1 : 0);

  // Bind the instant each mesh is created (a ref callback fires synchronously
  // during commit) rather than in an effect — R3F's render loop can tick
  // before a useEffect/useLayoutEffect runs, and THREE tries to call
  // `mesh.skeleton.update()` on every SkinnedMesh it renders, so an unbound
  // mesh (skeleton still undefined) crashes the whole canvas.
  const bindSkeleton = useCallback(
    (mesh: THREE.SkinnedMesh | null) => {
      if (mesh) mesh.bind(skeleton, new THREE.Matrix4());
    },
    [skeleton]
  );

  const [frontTex, backTex] = useTexture([frontUrl, backUrl]);

  useEffect(() => {
    [frontTex, backTex].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.needsUpdate = true;
    });
  }, [frontTex, backTex]);

  const geometry = getPageGeometry();
  const backGeometry = getPageBackGeometry();

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.72,
        metalness: 0,
        side: THREE.FrontSide,
      }),
    [frontTex]
  );
  const backMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.72,
        metalness: 0,
        side: THREE.BackSide,
      }),
    [backTex]
  );

  useEffect(() => {
    return () => {
      frontMaterial.dispose();
      backMaterial.dispose();
    };
  }, [frontMaterial, backMaterial]);

  const isForwardActive = leafIndex === page && page < TOTAL_STOPS;
  const isBackwardActive = leafIndex === page - 1 && page > 0;
  const isInteractive = isForwardActive || isBackwardActive;

  const lastAudibleStep = useRef(-1);

  useFrame((_, delta) => {
    const dragging = dragState.active && dragState.leaf === leafIndex;
    const target = dragging ? dragState.progress : leafIndex < page ? 1 : 0;
    const rate = dragging ? 26 : 7.5;
    progressRef.current = THREE.MathUtils.damp(progressRef.current, target, rate, delta);
    applyBend(bones, progressRef.current, !isCover);
    if (groupRef.current) {
      groupRef.current.position.z = depthForLeaf(leafIndex, progressRef.current);
    }

    if (dragging) {
      const step = Math.round(progressRef.current * 6);
      if (step !== lastAudibleStep.current) {
        lastAudibleStep.current = step;
        soundEngine.playTurn(0.35);
      }
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onStartDrag(leafIndex, e.nativeEvent.clientX);
  };

  const handlePointerOver = () => {
    if (isInteractive) document.body.style.cursor = "grab";
  };
  const handlePointerOut = () => {
    if (!dragState.active) document.body.style.cursor = "";
  };

  const initialProgress = leafIndex < page ? 1 : 0;
  return (
    <group ref={groupRef} position={[0, 0, depthForLeaf(leafIndex, initialProgress)]}>
      <primitive object={bones[0]} />
      <skinnedMesh
        ref={bindSkeleton}
        geometry={geometry}
        material={frontMaterial}
        castShadow
        receiveShadow
        frustumCulled={false}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <skinnedMesh
        ref={bindSkeleton}
        geometry={backGeometry}
        material={backMaterial}
        castShadow
        receiveShadow
        frustumCulled={false}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

export function FlatFiller({ leafIndex, page }: { leafIndex: number; page: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(leafIndex < page ? 1 : 0);
  const geometry = getPageGeometry();

  useFrame((_, delta) => {
    const target = leafIndex < page ? 1 : 0;
    progressRef.current = THREE.MathUtils.damp(progressRef.current, target, 7.5, delta);
    if (groupRef.current) {
      groupRef.current.rotation.y = -progressRef.current * Math.PI;
      groupRef.current.position.z = depthForLeaf(leafIndex, progressRef.current);
    }
  });

  const initialProgress = leafIndex < page ? 1 : 0;
  return (
    <group position={[0, 0, depthForLeaf(leafIndex, initialProgress)]} ref={groupRef}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color="#efe6d6" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export { PAGE_WIDTH, PAGE_HEIGHT };
