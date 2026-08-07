import { ExamPaper } from '../types';

/**
 * Generates 128kbps 44.1kHz stereo silent MP3 frame bytes for a given duration.
 */
export function getSilentMp3ArrayBuffer(durationSec: number): ArrayBuffer {
  const frameLength = 417; // 128kbps 44.1kHz frame size in bytes
  const framesCount = Math.max(1, Math.floor(durationSec * 38.28)); // ~38.28 frames/sec
  const buffer = new Uint8Array(framesCount * frameLength);

  for (let i = 0; i < framesCount; i++) {
    const offset = i * frameLength;
    buffer[offset] = 0xff;
    buffer[offset + 1] = 0xfb;
    buffer[offset + 2] = 0x90;
    buffer[offset + 3] = 0x64;
  }
  return buffer.buffer;
}

/**
 * Fetches raw MP3 audio stream from StreamElements Amazon Polly TTS API.
 */
async function fetchTtsMp3ArrayBuffer(text: string, voice: string): Promise<ArrayBuffer> {
  const cleanText = text
    .replace(/\[.*?\]/g, '')
    .replace(/---.*?---/g, '')
    .trim();

  if (!cleanText) {
    return getSilentMp3ArrayBuffer(0.5);
  }

  try {
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
      voice
    )}&text=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TTS API HTTP error ${response.status}`);
    }
    return await response.arrayBuffer();
  } catch (err) {
    console.warn(`[AudioGenerator] TTS fetch failed for voice ${voice}:`, err);
    return getSilentMp3ArrayBuffer(1.5);
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
 * Generates Part 1 (T/F female monologue) and Part 2 (A/B/C male/female dialogue) MP3 blobs for an ExamPaper.
 */
export async function generateExamAudioBlobs(paper: ExamPaper): Promise<GeneratedExamAudioResult> {
  const { part1Text, part2Lines } = parseAudioScript(paper.audioScript || '');

  // Voices
  const FEMALE_VOICE = 'Joanna'; // Amazon Polly US Female
  const MALE_VOICE = 'Brian';    // Amazon Polly UK Male

  const silence1s = getSilentMp3ArrayBuffer(1.0);
  const silence15s = getSilentMp3ArrayBuffer(1.5);
  const silence25s = getSilentMp3ArrayBuffer(2.5);
  const silence3s = getSilentMp3ArrayBuffer(3.0);
  const silence04s = getSilentMp3ArrayBuffer(0.4);

  // --- PART 1 AUDIO ---
  const p1Intro = await fetchTtsMp3ArrayBuffer(
    "Part 1: Listen to the passage and decide whether each statement is True or False. You will listen TWICE.",
    FEMALE_VOICE
  );
  const p1Prompt = await fetchTtsMp3ArrayBuffer("Listen.", FEMALE_VOICE);
  const p1Content = await fetchTtsMp3ArrayBuffer(part1Text, FEMALE_VOICE);
  const p1RepeatPrompt = await fetchTtsMp3ArrayBuffer("Now listen again.", FEMALE_VOICE);

  const part1Chunks: ArrayBuffer[] = [
    p1Intro,
    silence15s,
    p1Prompt,
    silence1s,
    p1Content,
    silence25s,
    p1RepeatPrompt,
    silence1s,
    p1Content,
    silence3s,
  ];

  const part1Blob = new Blob(part1Chunks, { type: 'audio/mp3' });

  // --- PART 2 AUDIO ---
  const p2Intro = await fetchTtsMp3ArrayBuffer(
    "Part 2: Listen to the conversation and choose the best answer A, B, or C for each question. You will listen TWICE.",
    FEMALE_VOICE
  );
  const p2Prompt = await fetchTtsMp3ArrayBuffer("Listen.", FEMALE_VOICE);
  const p2RepeatPrompt = await fetchTtsMp3ArrayBuffer("Now listen again.", FEMALE_VOICE);

  const dialogueChunks: ArrayBuffer[] = [];
  for (const line of part2Lines) {
    const voice = line.speaker === 'male' ? MALE_VOICE : FEMALE_VOICE;
    const buf = await fetchTtsMp3ArrayBuffer(line.text, voice);
    dialogueChunks.push(buf);
    dialogueChunks.push(silence04s);
  }

  const part2Chunks: ArrayBuffer[] = [
    p2Intro,
    silence15s,
    p2Prompt,
    silence1s,
    ...dialogueChunks,
    silence25s,
    p2RepeatPrompt,
    silence1s,
    ...dialogueChunks,
    silence3s,
  ];

  const part2Blob = new Blob(part2Chunks, { type: 'audio/mp3' });

  // --- FULL EXAM AUDIO ---
  const fullExamBlob = new Blob([...part1Chunks, silence3s, ...part2Chunks], { type: 'audio/mp3' });

  return {
    fullExamBlob,
    part1Blob,
    part2Blob,
  };
}
