// Procedurally synthesizes short paper-rustle / page-turn noise bursts.
// No external sound assets: raw noise + sparse crackle transients are built
// in plain JS, then run through a real Web Audio filter chain (a swept
// bandpass, standard biquad rolloff) via OfflineAudioContext for a natural,
// non-metallic timbre — hand-rolled differencing alone sounded too uniform
// and buzzy. The result is packaged as a WAV blob for Howler.

const SAMPLE_RATE = 44100;

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s / 4294967296) * 2 - 1;
  };
}

/** Raised-cosine (Hann) bump: 1 at `center`, 0 beyond `center ± width/2`. */
function hann(t: number, center: number, width: number): number {
  const d = Math.abs(t - center);
  if (d > width / 2) return 0;
  return 0.5 * (1 + Math.cos((Math.PI * d) / (width / 2)));
}

/**
 * A page turn reads as two audible events — the initial lift/crinkle as you
 * pinch the page, then a quieter glide, then a sharper settle as it flops
 * down — not one smooth decay. This shapes overall amplitude that way.
 */
function pageEnvelope(t: number, duration: number): number {
  const lift = hann(t, duration * 0.1, duration * 0.34) * 0.85;
  const settle = hann(t, duration * 0.82, duration * 0.36) * 0.7;
  const glideIn = Math.min(1, t / (duration * 0.1));
  const glideOut = Math.min(1, (duration - t) / (duration * 0.16));
  const glide = 0.16 * glideIn * glideOut;
  return Math.max(lift, settle, glide);
}

/** Sparse crackle transients, clustered near the lift and settle phases (not spread uniformly). */
function addCrackle(data: Float32Array, duration: number, rand: () => number) {
  const length = data.length;
  // Fewer, softer, longer-decaying spikes read as gentle paper crinkle;
  // too many sharp ones read as digital static.
  const spikeCount = 9 + Math.floor(Math.abs(rand()) * 8);
  for (let k = 0; k < spikeCount; k++) {
    // bias spike positions toward the two active phases via a bimodal pick
    const phase = rand() < 0 ? 0.1 : 0.82;
    const spread = 0.28;
    const tPos = Math.max(0, Math.min(1, phase + rand() * spread));
    const pos = Math.floor(tPos * (length - 60));
    const spikeLen = 8 + Math.floor(Math.abs(rand()) * 22);
    const spikeAmp = 0.16 + Math.abs(rand()) * 0.28;
    for (let j = 0; j < spikeLen && pos + j < length; j++) {
      data[pos + j] += rand() * spikeAmp * Math.exp(-j / (spikeLen * 0.55));
    }
  }
}

function normalize(data: Float32Array, target = 0.9) {
  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  if (peak > 0) {
    const norm = target / peak;
    for (let i = 0; i < data.length; i++) data[i] *= norm;
  }
}

interface SweepOptions {
  type: BiquadFilterType;
  q: number;
  freqPoints: Array<{ time: number; value: number }>;
  highpassFreq?: number;
}

/** Runs a raw buffer through a real biquad filter chain with automated sweep. */
async function applyFilterSweep(raw: Float32Array, opts: SweepOptions): Promise<Float32Array> {
  const ctx = new OfflineAudioContext(1, raw.length, SAMPLE_RATE);
  const buffer = ctx.createBuffer(1, raw.length, SAMPLE_RATE);
  buffer.copyToChannel(raw as Float32Array<ArrayBuffer>, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const sweep = ctx.createBiquadFilter();
  sweep.type = opts.type;
  sweep.Q.value = opts.q;
  const [first, ...rest] = opts.freqPoints;
  sweep.frequency.setValueAtTime(first.value, first.time);
  for (const point of rest) {
    sweep.frequency.linearRampToValueAtTime(point.value, point.time);
  }

  source.connect(sweep);
  let last: AudioNode = sweep;
  if (opts.highpassFreq) {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = opts.highpassFreq;
    last.connect(hp);
    last = hp;
  }
  last.connect(ctx.destination);

  source.start();
  const rendered = await ctx.startRendering();
  return rendered.getChannelData(0).slice();
}

async function synthPageTurn(seed: number, longer = false): Promise<Float32Array> {
  const duration = longer ? 0.58 : 0.42;
  const length = Math.floor(SAMPLE_RATE * duration);
  const rand = makeRng(seed);

  const raw = new Float32Array(length);
  for (let i = 0; i < length; i++) raw[i] = rand();
  addCrackle(raw, duration, rand);

  for (let i = 0; i < length; i++) raw[i] *= pageEnvelope(i / SAMPLE_RATE, duration);

  // Bandpass sweep: starts duller (paper lifting off the stack), brightens
  // through the middle of the turn, settles duller again as it flops flat —
  // this is the "whoosh" that makes it read as air/paper motion, not static.
  // Peak frequency kept modest (was 4200Hz) — anything brighter reads as a
  // harsh digital hiss rather than soft paper.
  const filtered = await applyFilterSweep(raw, {
    type: "bandpass",
    q: 0.55,
    freqPoints: [
      { time: 0, value: 1200 },
      { time: duration * 0.35, value: 3000 },
      { time: duration * 0.7, value: 2000 },
      { time: duration, value: 1000 },
    ],
    highpassFreq: 450,
  });

  normalize(filtered, 0.5);
  return filtered;
}

async function synthCoverThud(seed: number): Promise<Float32Array> {
  const duration = 0.32;
  const length = Math.floor(SAMPLE_RATE * duration);
  const rand = makeRng(seed);

  const raw = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / length;
    raw[i] = rand() * Math.exp(-t * 7);
  }

  const body = await applyFilterSweep(raw, {
    type: "lowpass",
    q: 0.9,
    freqPoints: [
      { time: 0, value: 180 },
      { time: duration * 0.5, value: 90 },
    ],
  });

  const tailRaw = new Float32Array(Math.floor(length * 0.85));
  for (let i = 0; i < tailRaw.length; i++) tailRaw[i] = rand();
  addCrackle(tailRaw, duration * 0.85, rand);
  const tail = await applyFilterSweep(tailRaw, {
    type: "bandpass",
    q: 0.6,
    freqPoints: [
      { time: 0, value: 2200 },
      { time: duration * 0.85, value: 1400 },
    ],
    highpassFreq: 600,
  });

  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = body[i] + (tail[i] ?? 0) * 0.25;
  }

  normalize(out, 0.55);
  return out;
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function encodeWAV(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return new Blob([buffer], { type: "audio/wav" });
}

export async function generateSoundSet(): Promise<{ turn: string[]; cover: string[] }> {
  const turnBuffers = await Promise.all([
    synthPageTurn(1000, false),
    synthPageTurn(1211, true),
    synthPageTurn(1422, false),
    synthPageTurn(1633, true),
  ]);
  const coverBuffers = await Promise.all([synthCoverThud(3000), synthCoverThud(3311)]);

  return {
    turn: turnBuffers.map((b) => URL.createObjectURL(encodeWAV(b))),
    cover: coverBuffers.map((b) => URL.createObjectURL(encodeWAV(b))),
  };
}
