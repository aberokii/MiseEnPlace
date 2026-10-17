// Composes the cut: base clips concatenated, transparent overlays placed at times, end card appended.
// Usage: node compose.mjs out/draft_cut_v2.mp4   (edit TIMELINE below)
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const FFMPEG = `${process.env.HOME}/.local/bin/ffmpeg`;
const out = process.argv[2] || 'out/draft_cut_v2.mp4';
const BASE = ['out/seg1.mp4', 'out/seg2.mp4', 'out/endcard.mp4'];        // in order
const OVERLAYS = [                                                        // [file, start s, duration s]
  ['out/t_name.mov',   0.3, 5],
  ['out/t_audit.mov', 11.0, 5],
  ['out/t_learn.mov', 30.0, 5],
  ['out/t_result.mov', 46.5, 6],
  ['out/t_build.mov', 56.0, 5],
];
const inputs = [];
BASE.forEach(f => inputs.push('-i', f));
OVERLAYS.forEach(([f]) => inputs.push('-i', f));
let fc = BASE.map((_, i) => `[${i}:v]`).join('') + `concat=n=${BASE.length}:v=1:a=0[b0];`;
OVERLAYS.forEach(([_, s, d], i) => {
  const idx = BASE.length + i;
  fc += `[${idx}:v]setpts=PTS-STARTPTS+${s}/TB[o${i}];[b${i}][o${i}]overlay=0:0:format=auto:enable='between(t,${s},${s + d})'[b${i + 1}];`;
});
fc = fc.slice(0, -1);
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', `[b${OVERLAYS.length}]`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('wrote', out);
