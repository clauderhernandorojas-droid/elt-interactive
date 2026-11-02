const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.resolve('scratch/test_verify_real.html').replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --dump-dom "file:///${filePath}"`;
const output = execSync(cmd, { encoding: 'utf8' });
console.log('Output length:', output.length);
const idx = output.indexOf('output-box');
console.log('Index of output-box:', idx);
if (idx !== -1) {
  console.log(output.substring(idx - 50, idx + 400));
}

