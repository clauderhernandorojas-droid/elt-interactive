const fs = require('fs');

const files = [
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1a.html',
  './INTERMEDIATE/INTERMEDIATE WB LESSONS/UNIT 1/1b.html',
  './INTERMEDIATE/INTERMEDIATE TESTS/Int Unit 1 Test.html'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    console.log('--- ' + file + ' ---');
    console.log('Length:', content.length);
    console.log('select count:', (content.match(/<select/gi) || []).length);
    console.log('radio count:', (content.match(/type=["']radio["']/gi) || []).length);
    console.log('button count:', (content.match(/<button/gi) || []).length);
    console.log('data-answer count:', (content.match(/data-answer/gi) || []).length);
    console.log('data-option count:', (content.match(/data-option/gi) || []).length);
    console.log('data-correct count:', (content.match(/data-correct/gi) || []).length);
  }
}

