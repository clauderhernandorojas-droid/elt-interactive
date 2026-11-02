const fs = require('fs');

const snippet = fs.readFileSync('scratch/export_script_snippet.js', 'utf8');
// Evaluate the concatenation
const code = eval(snippet.slice(0, -2)); // strip trailing ' +'
console.log('Code evaluated successfully. Character length:', code.length);

// Now test eval(code) inside a simulated browser or test with Function constructor
try {
  new Function('rawHtml', code + '\nreturn shuffleExerciseOptions(rawHtml);');
  console.log('new Function validation: SUCCESS! No syntax errors.');
} catch (e) {
  console.error('Validation FAILED:', e);
}

