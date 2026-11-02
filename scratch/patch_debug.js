const fs = require('fs');

let testHtml = fs.readFileSync('scratch/test_verify_real.html', 'utf8');
testHtml = testHtml.replace('<script>', `<script>
window.onerror = function(msg, url, line, col, err) {
  document.getElementById('output-box').textContent = 'ERROR:' + msg + ' on line ' + line;
};
try {`);
testHtml = testHtml.replace('</script>', `} catch(e) {
  document.getElementById('output-box').textContent = 'CATCH_ERROR:' + e.stack;
}
</script>`);
fs.writeFileSync('scratch/test_verify_real.html', testHtml);

