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
  accent: '#e94560'
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

const centerX = W / 2;
const centerY = H / 2;

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

ctx.font = 'bold 400px sans-serif';
const hashtag = '#';
const md = 'MD';
const hashtagWidth = ctx.measureText(hashtag).width;
const mdWidth = ctx.measureText(md).width;
const totalWidth = hashtagWidth + mdWidth + 20;
const startX = centerX - totalWidth / 2;

ctx.fillStyle = colors.accent;
ctx.fillText(hashtag, startX + hashtagWidth / 2, centerY);

ctx.fillStyle = colors.text;
ctx.fillText(md, startX + hashtagWidth + 20 + mdWidth / 2, centerY);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('build/icon.png', buffer);

console.log('Icon created: build/icon.png');
