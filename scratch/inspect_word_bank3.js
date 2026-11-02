const fs = require('fs');
const content = fs.readFileSync('./INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html', 'utf8');
const m = content.match(/const payload = "([^"]+)";/);
const deck = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
const s1 = deck[0].html;
const bIdx = s1.indexOf('<!-- Word Bank -->');
console.log(s1.substring(bIdx, bIdx + 800));

