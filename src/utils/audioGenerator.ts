import { ExamPaper } from '../types';

/**
 * Encodes an AudioBuffer into a standard uncompressed 16-bit PCM WAV Blob.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length;
  const dataByteLength = length * blockAlign;
  const headerByteLength = 44;
  const wavBuffer = new ArrayBuffer(headerByteLength + dataByteLength);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  // Write interleaved PCM audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Creates a silent AudioBuffer of specified duration in seconds.
 */
function createSilenceBuffer(audioCtx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = audioCtx.sampleRate || 44100;
  const frameCount = Math.max(1, Math.floor(sampleRate * durationSec));
  return audioCtx.createBuffer(1, frameCount, sampleRate);
}

/**
 * Concatenates an array of AudioBuffers into a single AudioBuffer.
 */
function concatenateAudioBuffers(audioCtx: AudioContext, buffers: AudioBuffer[]): AudioBuffer {
  const validBuffers = buffers.filter((b) => b && b.length > 0);
  if (validBuffers.length === 0) {
    return createSilenceBuffer(audioCtx, 1);
  }

  const sampleRate = validBuffers[0].sampleRate;
  const numChannels = Math.max(...validBuffers.map((b) => b.numberOfChannels));
  const totalLength = validBuffers.reduce((acc, b) => acc + b.length, 0);

  const outBuffer = audioCtx.createBuffer(numChannels, totalLength, sampleRate);

  let offset = 0;
  for (const buf of validBuffers) {
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buf.numberOfChannels > channel ? buf.getChannelData(channel) : buf.getChannelData(0);
      outBuffer.getChannelData(channel).set(channelData, offset);
    }
    offset += buf.length;
  }

  return outBuffer;
}

/**
 * Fetches an audio stream from StreamElements Amazon Polly TTS API and decodes to AudioBuffer.
 */
async function fetchTtsAudioBuffer(
  text: string,
  voice: string,
  audioCtx: AudioContext
): Promise<AudioBuffer> {
  const cleanText = text
    .replace(/\[.*?\]/g, '')
    .replace(/---.*?---/g, '')
    .trim();

  if (!cleanText) {
    return createSilenceBuffer(audioCtx, 0.5);
  }

  try {
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
      voice
    )}&text=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TTS API HTTP error ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.warn(`[AudioGenerator] TTS fetch failed for voice ${voice}, falling back to silent buffer:`, err);
    return createSilenceBuffer(audioCtx, 1.5);
  }
}

export interface ParsedAudioScript {
  part1Text: string;
  part2Lines: Array<{ speaker: 'male' | 'female'; text: string }>;
}

/**
 * Parses the raw audio script text into Part 1 (monologue) and Part 2 (dialogue lines).
 */
export function parseAudioScript(scriptText: string): ParsedAudioScript {
  if (!scriptText) {
    return {
      part1Text:
        "Last week, our school organized a green clean-up day. All students joined to collect plastic bottles and clean up the school playground. We had a great time together.",
      part2Lines: [
        { speaker: 'male', text: "Hi Sarah, are you ready for our English presentation tomorrow?" },
        { speaker: 'female', text: "Yes, Tom! I have finished making the slides about our local community center." },
        { speaker: 'male', text: "That's awesome! What time does the event start?" },
        { speaker: 'female', text: "It starts at 8:30 AM in the main hall." },
      ],
    };
  }

  let part1Text = '';
  let part2Text = '';

  const part2Match = scriptText.match(/---?\s*PART\s*2.*---?([\s\S]*)/i);
  if (part2Match) {
    part2Text = part2Match[1];
    const part1Match = scriptText.match(/---?\s*PART\s*1.*---?([\s\S]*?)(?=---?\s*PART\s*2|$)/i);
    part1Text = part1Match ? part1Match[1] : scriptText.substring(0, scriptText.indexOf(part2Match[0]));
  } else {
    // Split roughly in half if tags are missing
    const paragraphs = scriptText.split('\n\n').filter((p) => p.trim());
    const midIndex = Math.ceil(paragraphs.length / 2);
    part1Text = paragraphs.slice(0, midIndex).join('\n');
    part2Text = paragraphs.slice(midIndex).join('\n');
  }

  // Clean instructions or headers out of part 1 text
  part1Text = part1Text
    .replace(/^.*?Instructions:.*$/gmi, '')
    .replace(/^.*?Transcript:.*$/gmi, '')
    .replace(/\[MONOLOGUE\]/gi, '')
    .trim();

  // Parse dialogue lines for part 2
  const rawLines = part2Text
    .replace(/^.*?Instructions:.*$/gmi, '')
    .replace(/^.*?Transcript:.*$/gmi, '')
    .replace(/\[DIALOGUE\]/gi, '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const part2Lines: Array<{ speaker: 'male' | 'female'; text: string }> = [];

  const maleNamesRegex = /^(male|boy|tom|man|peter|john|david|alex|mark|nam|phong|mr\.?\s*\w+)\s*(\(male\))?\s*:\s*/i;
  const femaleNamesRegex = /^(female|girl|mary|woman|sarah|linda|anna|lan|hoa|ms\.?\s*\w+|mrs\.?\s*\w+)\s*(\(female\))?\s*:\s*/i;

  for (const line of rawLines) {
    if (maleNamesRegex.test(line)) {
      const cleanLineText = line.replace(maleNamesRegex, '').trim();
      if (cleanLineText) part2Lines.push({ speaker: 'male', text: cleanLineText });
    } else if (femaleNamesRegex.test(line)) {
      const cleanLineText = line.replace(femaleNamesRegex, '').trim();
      if (cleanLineText) part2Lines.push({ speaker: 'female', text: cleanLineText });
    } else {
      // Alternate if no prefix tag found
      const lastSpeaker = part2Lines.length > 0 ? part2Lines[part2Lines.length - 1].speaker : 'male';
      const currentSpeaker = lastSpeaker === 'male' ? 'female' : 'male';
      part2Lines.push({ speaker: currentSpeaker, text: line.replace(/^[A-Z][a-z]+\s*:\s*/, '') });
    }
  }

  return { part1Text, part2Lines };
}

export interface GeneratedExamAudioResult {
  fullExamBlob: Blob;
  part1Blob: Blob;
  part2Blob: Blob;
}

/**
 * Generates Part 1 (T/F female monologue) and Part 2 (A/B/C male/female dialogue) audio blobs for an ExamPaper.
 */
export async function generateExamAudioBlobs(paper: ExamPaper): Promise<GeneratedExamAudioResult> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  const { part1Text, part2Lines } = parseAudioScript(paper.audioScript || '');

  // 1. Voice constants
  const FEMALE_VOICE = 'Joanna'; // Amazon Polly US Female
  const MALE_VOICE = 'Brian';    // Amazon Polly UK Male

  // --- PART 1 AUDIO GENERATION ---
  // Sequence: Intro -> Pause -> "Listen." -> Monologue -> Pause -> "Listen again." -> Monologue -> Pause
  const p1IntroBuf = await fetchTtsAudioBuffer(
    "Part 1: Listen to the passage and decide whether each statement is True or False. You will listen TWICE.",
    FEMALE_VOICE,
    audioCtx
  );
  const p1PromptBuf = await fetchTtsAudioBuffer("Listen.", FEMALE_VOICE, audioCtx);
  const p1ContentBuf = await fetchTtsAudioBuffer(part1Text, FEMALE_VOICE, audioCtx);
  const p1RepeatPromptBuf = await fetchTtsAudioBuffer("Now listen again.", FEMALE_VOICE, audioCtx);

  const silence1s = createSilenceBuffer(audioCtx, 1.0);
  const silence15s = createSilenceBuffer(audioCtx, 1.5);
  const silence25s = createSilenceBuffer(audioCtx, 2.5);
  const silence3s = createSilenceBuffer(audioCtx, 3.0);

  const part1Buffers: AudioBuffer[] = [
    p1IntroBuf,
    silence15s,
    p1PromptBuf,
    silence1s,
    p1ContentBuf,
    silence25s,
    p1RepeatPromptBuf,
    silence1s,
    p1ContentBuf,
    silence3s,
  ];

  const part1AudioBuffer = concatenateAudioBuffers(audioCtx, part1Buffers);
  const part1Blob = audioBufferToWavBlob(part1AudioBuffer);

  // --- PART 2 AUDIO GENERATION ---
  // Sequence: Intro -> Pause -> "Listen." -> Dialogue (Male & Female lines) -> Pause -> "Listen again." -> Dialogue -> Pause
  const p2IntroBuf = await fetchTtsAudioBuffer(
    "Part 2: Listen to the conversation and choose the best answer A, B, or C for each question. You will listen TWICE.",
    FEMALE_VOICE,
    audioCtx
  );
  const p2PromptBuf = await fetchTtsAudioBuffer("Listen.", FEMALE_VOICE, audioCtx);
  const p2RepeatPromptBuf = await fetchTtsAudioBuffer("Now listen again.", FEMALE_VOICE, audioCtx);

  // Fetch dialogue line buffers
  const dialogueLineBuffers: AudioBuffer[] = [];
  for (const line of part2Lines) {
    const voice = line.speaker === 'male' ? MALE_VOICE : FEMALE_VOICE;
    const buf = await fetchTtsAudioBuffer(line.text, voice, audioCtx);
    dialogueLineBuffers.push(buf);
    dialogueLineBuffers.push(createSilenceBuffer(audioCtx, 0.4)); // 0.4s pause between dialogue turns
  }

  const part2Buffers: AudioBuffer[] = [
    p2IntroBuf,
    silence15s,
    p2PromptBuf,
    silence1s,
    ...dialogueLineBuffers,
    silence25s,
    p2RepeatPromptBuf,
    silence1s,
    ...dialogueLineBuffers,
    silence3s,
  ];

  const part2AudioBuffer = concatenateAudioBuffers(audioCtx, part2Buffers);
  const part2Blob = audioBufferToWavBlob(part2AudioBuffer);

  // --- FULL EXAM COMBINED AUDIO ---
  const fullExamAudioBuffer = concatenateAudioBuffers(audioCtx, [
    part1AudioBuffer,
    silence3s,
    part2AudioBuffer,
  ]);
  const fullExamBlob = audioBufferToWavBlob(fullExamAudioBuffer);

  audioCtx.close();

  return {
    fullExamBlob,
    part1Blob,
    part2Blob,
  };
}
