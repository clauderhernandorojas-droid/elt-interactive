const fs = require('fs');

const snippet = fs.readFileSync('scratch/export_script_snippet.js', 'utf8');
const code = eval(snippet.slice(0, -2));

const lines = code.split('\n');
lines.forEach((l, idx) => console.log((idx + 1) + ': ' + l));

