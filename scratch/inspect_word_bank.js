const fs = require('fs');
const content = fs.readFileSync('./INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html', 'utf8');
const m = content.match(/const payload = "([^"]+)";/);
const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
const s1 = deck[0].html;
console.log('--- Unit 1 Test Slide 1 Word Bank ---');
const bIdx = s1.indexOf('Word Bank');
console.log(s1.substring(Math.max(0, bIdx - 100), Math.min(s1.length, bIdx + 500)));

