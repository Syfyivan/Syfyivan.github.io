import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SAMPLE_RATE = 44100;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(SCRIPT_DIR, "../source/mahjong/audio");
const TEMP_DIR = mkdtempSync(join(tmpdir(), "mahjong-audio-"));

function stereo(duration) {
  const length = Math.ceil(duration * SAMPLE_RATE);
  return [new Float32Array(length), new Float32Array(length)];
}

function midi(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function panGains(pan = 0) {
  const angle = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
}

function envelope(time, duration, attack, release, decay = 0) {
  const attackGain = attack > 0 ? Math.min(1, time / attack) : 1;
  const remaining = duration - time;
  const releaseGain = release > 0 ? Math.min(1, remaining / release) : 1;
  return Math.max(0, Math.min(attackGain, releaseGain)) * Math.exp(-decay * time);
}

function addTone(track, options) {
  const {
    start = 0,
    duration = 0.5,
    frequency = 440,
    amplitude = 0.1,
    pan = 0,
    attack = 0.01,
    release = 0.15,
    decay = 0,
    partials = [[1, 1]],
    vibrato = 0
  } = options;
  const startSample = Math.max(0, Math.floor(start * SAMPLE_RATE));
  const endSample = Math.min(track[0].length, Math.ceil((start + duration) * SAMPLE_RATE));
  const [leftGain, rightGain] = panGains(pan);
  for (let sampleIndex = startSample; sampleIndex < endSample; sampleIndex += 1) {
    const time = sampleIndex / SAMPLE_RATE - start;
    const env = envelope(time, duration, attack, release, decay);
    const pitch = frequency * (1 + Math.sin(2 * Math.PI * 5.2 * time) * vibrato);
    let value = 0;
    for (const [ratio, level] of partials) {
      value += Math.sin(2 * Math.PI * pitch * ratio * time) * level;
    }
    value *= amplitude * env;
    track[0][sampleIndex] += value * leftGain;
    track[1][sampleIndex] += value * rightGain;
  }
}

function addPluck(track, start, note, amplitude = 0.1, pan = 0, duration = 1.2) {
  addTone(track, {
    start,
    duration,
    frequency: midi(note),
    amplitude,
    pan,
    attack: 0.004,
    release: 0.16,
    decay: 2.9,
    partials: [[1, 1], [2, 0.34], [3, 0.15], [4, 0.06]]
  });
}

function makeRandom(seed) {
  let value = seed >>> 0;
  return function () {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function addClack(track, start, amplitude = 0.18, pan = 0, seed = 1) {
  const duration = 0.16;
  const startSample = Math.max(0, Math.floor(start * SAMPLE_RATE));
  const endSample = Math.min(track[0].length, Math.ceil((start + duration) * SAMPLE_RATE));
  const [leftGain, rightGain] = panGains(pan);
  const random = makeRandom(seed);
  let previousNoise = 0;
  for (let sampleIndex = startSample; sampleIndex < endSample; sampleIndex += 1) {
    const time = sampleIndex / SAMPLE_RATE - start;
    const noise = random() * 2 - 1;
    const brightNoise = noise - previousNoise * 0.72;
    const resonance = Math.sin(2 * Math.PI * 1180 * time) * 0.44
      + Math.sin(2 * Math.PI * 1840 * time) * 0.2;
    const value = (brightNoise * 0.68 + resonance) * amplitude * Math.exp(-34 * time);
    previousNoise = noise;
    track[0][sampleIndex] += value * leftGain;
    track[1][sampleIndex] += value * rightGain;
  }
}

function addMahjongImpact(track, start, options = {}) {
  const {
    force = 0.6,
    pan = 0,
    seed = 1,
    table = 0.65,
    brightness = 1,
    duration = 0.28
  } = options;
  const startSample = Math.max(0, Math.floor(start * SAMPLE_RATE));
  const endSample = Math.min(track[0].length, Math.ceil((start + duration) * SAMPLE_RATE));
  const [leftGain, rightGain] = panGains(pan);
  const random = makeRandom(seed);
  const tileModes = [
    [1320, 0.2, 46],
    [1880, 0.3, 54],
    [2670, 0.27, 65],
    [3480, 0.22, 76],
    [4630, 0.16, 91],
    [6180, 0.1, 110],
    [7920, 0.055, 138]
  ].map(([frequency, level, decay]) => ({
    frequency: frequency * (0.975 + random() * 0.05),
    level: level * (0.9 + random() * 0.2),
    decay: decay * (0.92 + random() * 0.16),
    phase: random() * Math.PI * 2
  }));
  const tableModes = [
    [145, 0.32, 21],
    [236, 0.22, 26],
    [397, 0.13, 32],
    [675, 0.075, 39]
  ].map(([frequency, level, decay]) => ({
    frequency: frequency * (0.96 + random() * 0.08),
    level,
    decay,
    phase: random() * Math.PI * 2
  }));
  let previousNoise = 0;

  for (let sampleIndex = startSample; sampleIndex < endSample; sampleIndex += 1) {
    const time = sampleIndex / SAMPLE_RATE - start;
    const noise = random() * 2 - 1;
    const contactNoise = noise - previousNoise * 0.78;
    let tileBody = 0;
    let tableBody = 0;
    for (const mode of tileModes) {
      tileBody += Math.sin(2 * Math.PI * mode.frequency * time + mode.phase)
        * mode.level
        * Math.exp(-mode.decay * time);
    }
    for (const mode of tableModes) {
      tableBody += Math.sin(2 * Math.PI * mode.frequency * time + mode.phase)
        * mode.level
        * Math.exp(-mode.decay * time);
    }
    const contact = contactNoise * Math.exp(-(300 + brightness * 95) * time) * (0.3 + brightness * 0.14);
    const value = force * (contact + tileBody * brightness * 0.46 + tableBody * table * 0.42);
    previousNoise = noise;
    track[0][sampleIndex] += value * leftGain;
    track[1][sampleIndex] += value * rightGain;
  }
}

function addFeltScrape(track, start, duration, options = {}) {
  const {
    amplitude = 0.055,
    panStart = -0.2,
    panEnd = 0.2,
    seed = 1,
    roughness = 1
  } = options;
  const startSample = Math.max(0, Math.floor(start * SAMPLE_RATE));
  const endSample = Math.min(track[0].length, Math.ceil((start + duration) * SAMPLE_RATE));
  const random = makeRandom(seed);
  let fast = 0;
  let slow = 0;

  for (let sampleIndex = startSample; sampleIndex < endSample; sampleIndex += 1) {
    const time = sampleIndex / SAMPLE_RATE - start;
    const progress = Math.min(1, time / duration);
    const noise = random() * 2 - 1;
    fast = fast * 0.58 + noise * 0.42;
    slow = slow * 0.965 + noise * 0.035;
    const grain = fast - slow;
    const stickSlip = 0.56 + 0.44 * Math.max(0, Math.sin(2 * Math.PI * (31 + seed % 11) * time));
    const env = Math.sin(Math.PI * progress) ** 0.62;
    const value = grain * stickSlip * env * amplitude * roughness;
    const pan = panStart + (panEnd - panStart) * progress;
    const [leftGain, rightGain] = panGains(pan);
    track[0][sampleIndex] += value * leftGain;
    track[1][sampleIndex] += value * rightGain;
  }
}

function addDiceImpact(track, start, options = {}) {
  const {
    force = 0.4,
    pan = 0,
    seed = 1
  } = options;
  const startSample = Math.max(0, Math.floor(start * SAMPLE_RATE));
  const duration = 0.18;
  const endSample = Math.min(track[0].length, Math.ceil((start + duration) * SAMPLE_RATE));
  const [leftGain, rightGain] = panGains(pan);
  const random = makeRandom(seed);
  const modes = [940, 1680, 2860, 4310, 6570].map((frequency, index) => ({
    frequency: frequency * (0.965 + random() * 0.07),
    level: [0.25, 0.3, 0.24, 0.16, 0.08][index],
    decay: [55, 68, 82, 105, 140][index],
    phase: random() * Math.PI * 2
  }));
  let previousNoise = 0;

  for (let sampleIndex = startSample; sampleIndex < endSample; sampleIndex += 1) {
    const time = sampleIndex / SAMPLE_RATE - start;
    const noise = random() * 2 - 1;
    let body = 0;
    for (const mode of modes) {
      body += Math.sin(2 * Math.PI * mode.frequency * time + mode.phase)
        * mode.level
        * Math.exp(-mode.decay * time);
    }
    const contact = (noise - previousNoise * 0.72) * Math.exp(-420 * time) * 0.34;
    const value = force * (contact + body);
    previousNoise = noise;
    track[0][sampleIndex] += value * leftGain;
    track[1][sampleIndex] += value * rightGain;
  }
}

function addRoomAir(track, amplitude = 0.0025) {
  const random = makeRandom(20260810);
  let filtered = 0;
  for (let index = 0; index < track[0].length; index += 1) {
    filtered = filtered * 0.985 + (random() * 2 - 1) * 0.015;
    const value = filtered * amplitude;
    track[0][index] += value;
    track[1][index] += value * 0.94;
  }
}

function fadeEdges(track, duration = 0.5) {
  const fadeSamples = Math.floor(duration * SAMPLE_RATE);
  for (let index = 0; index < fadeSamples; index += 1) {
    const gain = 0.5 - 0.5 * Math.cos(Math.PI * index / fadeSamples);
    const endIndex = track[0].length - index - 1;
    track[0][index] *= gain;
    track[1][index] *= gain;
    track[0][endIndex] *= gain;
    track[1][endIndex] *= gain;
  }
}

function softLimit(track) {
  for (const channel of track) {
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.tanh(channel[index] * 1.18) * 0.82;
    }
  }
}

function createAmbientMusic() {
  const beat = 0.75;
  const bars = 8;
  const track = stereo(beat * 4 * bars);
  const roots = [50, 55, 57, 50, 55, 52, 57, 50];
  const phrases = [
    [62, 69, 74, 69],
    [67, 74, 71, 69],
    [69, 76, 73, 71],
    [62, 66, 69, 74],
    [67, 71, 74, 71],
    [64, 69, 71, 76],
    [69, 73, 76, 73],
    [74, 69, 66, 62]
  ];

  addRoomAir(track);
  roots.forEach((root, barIndex) => {
    const barStart = barIndex * beat * 4;
    [root, root + 7, root + 12].forEach((note, noteIndex) => {
      addTone(track, {
        start: barStart,
        duration: beat * 4.2,
        frequency: midi(note),
        amplitude: noteIndex === 0 ? 0.032 : 0.019,
        pan: (noteIndex - 1) * 0.28,
        attack: 0.55,
        release: 0.85,
        partials: [[1, 1], [2, 0.12], [0.5, 0.08]],
        vibrato: 0.0012
      });
    });
    phrases[barIndex].forEach((note, beatIndex) => {
      addPluck(track, barStart + beatIndex * beat + 0.05, note, 0.047, beatIndex % 2 ? 0.25 : -0.25, 1.25);
    });
    addClack(track, barStart + beat * 1.02, 0.022, -0.38, 100 + barIndex);
    addClack(track, barStart + beat * 3.02, 0.018, 0.38, 200 + barIndex);
  });
  fadeEdges(track, 0.72);
  softLimit(track);
  return track;
}

function createSelectSound() {
  const track = stereo(0.24);
  addFeltScrape(track, 0.012, 0.075, {
    amplitude: 0.026,
    panStart: -0.04,
    panEnd: 0.04,
    seed: 31,
    roughness: 0.75
  });
  addMahjongImpact(track, 0.082, {
    force: 0.23,
    pan: 0.04,
    seed: 32,
    table: 0.18,
    brightness: 0.92,
    duration: 0.16
  });
  softLimit(track);
  return track;
}

function createDrawSound() {
  const track = stereo(0.46);
  addMahjongImpact(track, 0.012, {
    force: 0.18,
    pan: -0.3,
    seed: 51,
    table: 0.12,
    brightness: 1.05,
    duration: 0.13
  });
  addFeltScrape(track, 0.035, 0.21, {
    amplitude: 0.058,
    panStart: -0.3,
    panEnd: 0.12,
    seed: 52,
    roughness: 1.05
  });
  addMahjongImpact(track, 0.232, {
    force: 0.34,
    pan: 0.13,
    seed: 53,
    table: 0.42,
    brightness: 0.94,
    duration: 0.2
  });
  softLimit(track);
  return track;
}

function createDiscardSound() {
  const track = stereo(0.44);
  addMahjongImpact(track, 0.024, {
    force: 0.86,
    pan: -0.08,
    seed: 61,
    table: 0.95,
    brightness: 1.08,
    duration: 0.3
  });
  addMahjongImpact(track, 0.085, {
    force: 0.17,
    pan: 0.02,
    seed: 62,
    table: 0.58,
    brightness: 0.84,
    duration: 0.18
  });
  addFeltScrape(track, 0.105, 0.16, {
    amplitude: 0.033,
    panStart: -0.04,
    panEnd: 0.16,
    seed: 63,
    roughness: 0.82
  });
  softLimit(track);
  return track;
}

function createTurnSound() {
  const track = stereo(0.46);
  addMahjongImpact(track, 0.025, {
    force: 0.28,
    pan: -0.12,
    seed: 71,
    table: 0.35,
    brightness: 0.96,
    duration: 0.2
  });
  addMahjongImpact(track, 0.17, {
    force: 0.22,
    pan: 0.12,
    seed: 72,
    table: 0.3,
    brightness: 0.9,
    duration: 0.19
  });
  softLimit(track);
  return track;
}

function createClaimSound() {
  const track = stereo(0.4);
  addMahjongImpact(track, 0.025, {
    force: 0.31,
    pan: -0.08,
    seed: 81,
    table: 0.16,
    brightness: 1.12,
    duration: 0.2
  });
  addMahjongImpact(track, 0.13, {
    force: 0.3,
    pan: 0.08,
    seed: 82,
    table: 0.16,
    brightness: 1.08,
    duration: 0.2
  });
  softLimit(track);
  return track;
}

function createChowSound() {
  const track = stereo(0.68);
  addFeltScrape(track, 0.018, 0.13, {
    amplitude: 0.042,
    panStart: -0.32,
    panEnd: -0.12,
    seed: 91
  });
  [-0.2, 0, 0.2].forEach((pan, index) => {
    addMahjongImpact(track, 0.13 + index * 0.105, {
      force: 0.43 - index * 0.025,
      pan,
      seed: 92 + index,
      table: 0.72,
      brightness: 0.94,
      duration: 0.23
    });
  });
  addFeltScrape(track, 0.37, 0.16, {
    amplitude: 0.03,
    panStart: -0.18,
    panEnd: 0.18,
    seed: 95,
    roughness: 0.78
  });
  softLimit(track);
  return track;
}

function createPongSound() {
  const track = stereo(0.64);
  addMahjongImpact(track, 0.035, {
    force: 0.57,
    pan: -0.15,
    seed: 101,
    table: 0.48,
    brightness: 1.04,
    duration: 0.24
  });
  addMahjongImpact(track, 0.13, {
    force: 0.6,
    pan: 0.1,
    seed: 102,
    table: 0.5,
    brightness: 1.06,
    duration: 0.25
  });
  addMahjongImpact(track, 0.255, {
    force: 0.3,
    pan: 0.02,
    seed: 103,
    table: 0.72,
    brightness: 0.86,
    duration: 0.2
  });
  addFeltScrape(track, 0.29, 0.16, {
    amplitude: 0.029,
    panStart: -0.08,
    panEnd: 0.11,
    seed: 104,
    roughness: 0.72
  });
  softLimit(track);
  return track;
}

function createKongSound() {
  const track = stereo(0.82);
  [-0.24, -0.08, 0.09, 0.24].forEach((pan, index) => {
    addMahjongImpact(track, 0.028 + index * 0.088, {
      force: 0.48 + (index % 2) * 0.05,
      pan,
      seed: 111 + index,
      table: 0.62,
      brightness: 0.98,
      duration: 0.23
    });
  });
  addFeltScrape(track, 0.33, 0.17, {
    amplitude: 0.032,
    panStart: -0.2,
    panEnd: 0.18,
    seed: 116,
    roughness: 0.8
  });
  addMahjongImpact(track, 0.47, {
    force: 0.42,
    pan: 0.12,
    seed: 117,
    table: 0.38,
    brightness: 1.05,
    duration: 0.24
  });
  softLimit(track);
  return track;
}

function createBaoSound() {
  const track = stereo(1.05);
  const hits = [
    [0.025, 0.52, -0.28],
    [0.105, 0.46, 0.24],
    [0.19, 0.38, -0.12],
    [0.29, 0.33, 0.18],
    [0.405, 0.27, -0.08],
    [0.54, 0.22, 0.1],
    [0.7, 0.18, -0.03]
  ];
  hits.forEach(([start, force, pan], index) => {
    addDiceImpact(track, start, { force, pan, seed: 121 + index });
  });
  softLimit(track);
  return track;
}

function createEndSound() {
  const track = stereo(1.5);
  addFeltScrape(track, 0.025, 0.88, {
    amplitude: 0.054,
    panStart: -0.34,
    panEnd: 0.34,
    seed: 131,
    roughness: 1.2
  });
  const impacts = [
    [0.04, 0.55, -0.3],
    [0.12, 0.46, 0.22],
    [0.205, 0.58, -0.12],
    [0.31, 0.42, 0.31],
    [0.43, 0.5, -0.25],
    [0.56, 0.37, 0.08],
    [0.7, 0.43, 0.25],
    [0.86, 0.3, -0.06]
  ];
  impacts.forEach(([start, force, pan], index) => {
    addMahjongImpact(track, start, {
      force,
      pan,
      seed: 132 + index,
      table: 0.56,
      brightness: 0.96,
      duration: 0.25
    });
  });
  softLimit(track);
  return track;
}

function writeWav(filePath, track) {
  const sampleCount = track[0].length;
  const channelCount = 2;
  const bytesPerSample = 2;
  const dataSize = sampleCount * channelCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * channelCount * bytesPerSample, 28);
  buffer.writeUInt16LE(channelCount * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let index = 0; index < sampleCount; index += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const value = Math.max(-1, Math.min(1, track[channel][index]));
      buffer.writeInt16LE(Math.round(value * 32767), offset);
      offset += bytesPerSample;
    }
  }
  writeFileSync(filePath, buffer);
}

function ffmpegCommand() {
  const candidates = [process.env.FFMPEG, "/opt/homebrew/bin/ffmpeg", "ffmpeg"].filter(Boolean);
  return candidates.find((candidate) => candidate === "ffmpeg" || existsSync(candidate)) || "ffmpeg";
}

function encodeMp3(name, track, bitrate) {
  const wavPath = join(TEMP_DIR, name + ".wav");
  const outputPath = join(OUTPUT_DIR, name + ".mp3");
  writeWav(wavPath, track);
  const result = spawnSync(ffmpegCommand(), [
    "-y",
    "-loglevel", "error",
    "-i", wavPath,
    "-codec:a", "libmp3lame",
    "-b:a", bitrate,
    "-ar", String(SAMPLE_RATE),
    "-ac", "2",
    outputPath
  ], { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error("ffmpeg failed while encoding " + name);
  }
}

mkdirSync(OUTPUT_DIR, { recursive: true });

try {
  encodeMp3("ambient-night", createAmbientMusic(), "112k");
  encodeMp3("tile-select", createSelectSound(), "96k");
  encodeMp3("tile-draw", createDrawSound(), "96k");
  encodeMp3("tile-discard", createDiscardSound(), "96k");
  encodeMp3("turn", createTurnSound(), "96k");
  encodeMp3("claim", createClaimSound(), "96k");
  encodeMp3("chow", createChowSound(), "96k");
  encodeMp3("pong", createPongSound(), "96k");
  encodeMp3("kong", createKongSound(), "96k");
  encodeMp3("bao", createBaoSound(), "96k");
  encodeMp3("round-end", createEndSound(), "96k");
  console.log("Generated Mahjong audio in " + OUTPUT_DIR);
} finally {
  rmSync(TEMP_DIR, { recursive: true, force: true });
}
