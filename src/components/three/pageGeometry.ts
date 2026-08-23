import * as THREE from "three";

export const PAGE_WIDTH = 1.5;
export const PAGE_HEIGHT = 1.5;
export const PAGE_SEGMENTS = 22;
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
export const PAGE_THICKNESS = 0.004;
export const CURL_STRENGTH = 0.85;

let sharedGeometry: THREE.PlaneGeometry | null = null;
let sharedBackGeometry: THREE.PlaneGeometry | null = null;

/** One shared, pre-skinned plane geometry reused by every leaf's front-facing mesh. */
export function getPageGeometry(): THREE.PlaneGeometry {
  if (sharedGeometry) return sharedGeometry;

  const geometry = new THREE.PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_SEGMENTS, 2);
  geometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = Math.max(0, vertex.x);
    const segIndex = Math.min(PAGE_SEGMENTS - 1, Math.floor(x / SEGMENT_WIDTH));
    const segFrac = THREE.MathUtils.clamp(x / SEGMENT_WIDTH - segIndex, 0, 1);
    skinIndices.push(segIndex, segIndex + 1, 0, 0);
    skinWeights.push(1 - segFrac, segFrac, 0, 0);
  }

  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
  sharedGeometry = geometry;
  return geometry;
}

/**
 * Same geometry as the front face (shares position/skin attributes by
 * reference) but with the U coordinate mirrored. Rendering the back
 * material with `side: BackSide` on identical UVs would show the texture
 * flipped left-right — flipping U here cancels that out so back-page text
 * reads correctly once the leaf has turned.
 */
export function getPageBackGeometry(): THREE.PlaneGeometry {
  if (sharedBackGeometry) return sharedBackGeometry;

  const front = getPageGeometry();
  const back = new THREE.PlaneGeometry(1, 1, 1, 1); // placeholder, attributes replaced below
  back.setAttribute("position", front.attributes.position);
  back.setAttribute("normal", front.attributes.normal);
  back.setAttribute("skinIndex", front.attributes.skinIndex);
  back.setAttribute("skinWeight", front.attributes.skinWeight);
  back.index = front.index;

  const frontUv = front.attributes.uv;
  const flippedUv = new Float32Array(frontUv.count * 2);
  for (let i = 0; i < frontUv.count; i++) {
    flippedUv[i * 2] = 1 - frontUv.getX(i);
    flippedUv[i * 2 + 1] = frontUv.getY(i);
  }
  back.setAttribute("uv", new THREE.BufferAttribute(flippedUv, 2));

  sharedBackGeometry = back;
  return back;
}

export function createBoneChain(): THREE.Bone[] {
  const bones: THREE.Bone[] = [];
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    const bone = new THREE.Bone();
    bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
    bones.push(bone);
    if (i > 0) bones[i - 1].add(bone);
  }
  return bones;
}

/**
 * Bends a bone chain to represent a page at turn-progress `p` (0 = resting
 * closed on the right stack, 1 = resting closed on the left stack), with an
 * S-curve curl that peaks mid-turn and flattens out at rest, like real paper.
 */
export function applyBend(bones: THREE.Bone[], p: number, curlEnabled: boolean) {
  const baseAngle = -p * Math.PI;
  const curlPeak = curlEnabled ? Math.sin(p * Math.PI) : 0;
  const last = bones.length - 1;

  let prevCurl = 0;
  for (let i = 0; i <= last; i++) {
    const t = i / last;
    const curl = curlPeak * CURL_STRENGTH * Math.pow(t, 1.6);
    if (i === 0) {
      bones[i].rotation.y = baseAngle;
    } else {
      bones[i].rotation.y = curl - prevCurl;
    }
    prevCurl = curl;
  }
}
