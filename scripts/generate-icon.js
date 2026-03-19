const { createCanvas } = require('canvas');
const fs = require('fs');

const W = 1024;
const H = 1024;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const colors = {
  bg: '#1a1a2e',
  border: '#16213e',
  text: '#ffffff',
  accent1: '#e94560',
  accent2: '#0f3460',
  accent3: '#533483',
  code: '#f1fa8c'
};

ctx.fillStyle = colors.bg;
ctx.fillRect(0, 0, W, H);

const padding = 80;
const docW = W - padding * 2;
const docH = H - padding * 2;
const radius = 80;

ctx.fillStyle = colors.border;
ctx.beginPath();
ctx.roundRect(padding - 10, padding - 10, docW + 20, docH + 20, radius + 10);
ctx.fill();

ctx.fillStyle = colors.bg;
ctx.beginPath();
ctx.roundRect(padding, padding, docW, docH, radius);
ctx.fill();

const lineY = padding + 180;
const lineSpacing = 160;
const startX = padding + 100;

ctx.font = 'bold 120px sans-serif';

ctx.fillStyle = colors.accent1;
ctx.fillText('#', startX, lineY);

ctx.fillStyle = colors.text;
ctx.font = 'bold 120px sans-serif';
ctx.fillText('Markdown', startX + 150, lineY);

ctx.fillStyle = colors.accent1;
ctx.font = '120px sans-serif';
ctx.fillText('Viewer', startX + 540, lineY);

ctx.font = '100px sans-serif';
const line2Y = lineY + lineSpacing;

ctx.fillStyle = colors.accent2;
ctx.fillText('**bold**', startX, line2Y);

ctx.fillStyle = colors.accent3;
ctx.fillText('> quote', startX + 320, line2Y);

ctx.fillStyle = colors.code;
ctx.fillText('`code`', startX + 700, line2Y);

const line3Y = line2Y + lineSpacing;

ctx.fillStyle = colors.text;
ctx.fillText('- list', startX, line3Y);

ctx.fillStyle = colors.accent1;
ctx.fillText('~strikethrough~', startX + 250, line3Y);

ctx.fillStyle = colors.accent3;
ctx.fillText('[link]()', startX + 650, line3Y);

ctx.fillStyle = colors.code;
ctx.font = '80px monospace';
ctx.fillText('```', startX, line3Y + 100);
ctx.fillText('code', startX + 140, line3Y + 100);
ctx.fillText('```', startX + 310, line3Y + 100);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('build/icon.png', buffer);

console.log('Icon created: build/icon.png');