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

function addBell(track, start, note, amplitude = 0.1, pan = 0, duration = 1.5) {
  addTone(track, {
    start,
    duration,
    frequency: midi(note),
    amplitude,
    pan,
    attack: 0.003,
    release: 0.28,
    decay: 1.7,
    vibrato: 0.0008,
    partials: [[1, 1], [2.01, 0.32], [2.98, 0.17], [4.16, 0.08]]
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
  const track = stereo(0.2);
  addClack(track, 0.012, 0.24, 0.08, 31);
  addTone(track, {
    start: 0.012,
    duration: 0.12,
    frequency: midi(86),
    amplitude: 0.07,
    decay: 20,
    attack: 0.002,
    release: 0.04
  });
  softLimit(track);
  return track;
}

function createDiscardSound() {
  const track = stereo(0.34);
  addClack(track, 0.018, 0.34, -0.18, 41);
  addClack(track, 0.092, 0.25, 0.2, 43);
  addTone(track, {
    start: 0.02,
    duration: 0.22,
    frequency: 310,
    amplitude: 0.075,
    decay: 13,
    attack: 0.002,
    release: 0.08,
    partials: [[1, 1], [1.52, 0.3], [2.1, 0.14]]
  });
  softLimit(track);
  return track;
}

function createTurnSound() {
  const track = stereo(0.72);
  addPluck(track, 0.03, 74, 0.13, -0.15, 0.62);
  addPluck(track, 0.22, 78, 0.12, 0.16, 0.58);
  softLimit(track);
  return track;
}

function createClaimSound() {
  const track = stereo(0.9);
  addPluck(track, 0.025, 69, 0.12, -0.22, 0.7);
  addPluck(track, 0.18, 74, 0.115, 0, 0.7);
  addPluck(track, 0.335, 79, 0.105, 0.22, 0.72);
  softLimit(track);
  return track;
}

function createBaoSound() {
  const track = stereo(1.45);
  addBell(track, 0.025, 81, 0.12, -0.14, 1.3);
  addBell(track, 0.19, 86, 0.1, 0.18, 1.2);
  addBell(track, 0.36, 90, 0.055, 0.32, 0.95);
  softLimit(track);
  return track;
}

function createEndSound() {
  const track = stereo(1.95);
  addPluck(track, 0.03, 69, 0.1, -0.28, 1.15);
  addPluck(track, 0.28, 74, 0.11, -0.08, 1.2);
  addBell(track, 0.55, 78, 0.085, 0.13, 1.25);
  addBell(track, 0.82, 81, 0.075, 0.28, 1.05);
  addTone(track, {
    start: 0.55,
    duration: 1.2,
    frequency: midi(50),
    amplitude: 0.038,
    attack: 0.18,
    release: 0.5,
    partials: [[1, 1], [2, 0.16]]
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
  encodeMp3("tile-discard", createDiscardSound(), "96k");
  encodeMp3("turn", createTurnSound(), "96k");
  encodeMp3("claim", createClaimSound(), "96k");
  encodeMp3("bao", createBaoSound(), "96k");
  encodeMp3("round-end", createEndSound(), "96k");
  console.log("Generated Mahjong audio in " + OUTPUT_DIR);
} finally {
  rmSync(TEMP_DIR, { recursive: true, force: true });
}
