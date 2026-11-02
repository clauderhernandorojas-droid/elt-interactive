const fs = require('fs');
const content = fs.readFileSync('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html', 'utf8');
const match = content.match(/const payload = "([^"]+)";/);
if (match) {
  const deck = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  console.log('Slide 1 snippet around data-option:');
  const s1 = deck[0].html;
  const optIdx = s1.indexOf('data-option');
  console.log(s1.substring(Math.max(0, optIdx - 300), Math.min(s1.length, optIdx + 800)));
}

