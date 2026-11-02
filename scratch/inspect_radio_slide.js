const fs = require('fs');
const content = fs.readFileSync('./INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 2/2c.html', 'utf8');
const m = content.match(/const payload = "([^"]+)";/);
const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
const s3 = deck[2].html;
console.log('Snippet of Slide 3:');
const rIdx = s3.indexOf('type="radio"');
console.log(s3.substring(Math.max(0, rIdx - 300), Math.min(s3.length, rIdx + 600)));

