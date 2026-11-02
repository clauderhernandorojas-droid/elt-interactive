const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
console.log('Includes CRLF:', content.includes('\r\n'));
const targetIdx = content.indexOf('function shuffleSelectHtmlOptions');
console.log('Target found at index:', targetIdx);

