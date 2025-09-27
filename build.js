const browserify = require('browserify');
const uglify = require('uglify-js');
const fs = require('fs');
const path = require('path');

const inputFile = 'src/index.js';
const outputFile = 'dist/bundle.js';

const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.cpSync('style.css', path.join(outputDir, 'style.css'));

const b = browserify(inputFile).transform('babelify');

b.bundle((err, buf) => {
  if (err) {
    console.error('Browserify error:', err);
    return;
  }

  const code = buf.toString();
  const minified = uglify.minify(code);
  if (minified.error) {
    console.error('UglifyJS error:', minified.error);
    return;
  }

  fs.writeFile(outputFile, minified.code, (writeErr) => {
    if (writeErr) {
      console.error('Write file error:', writeErr);
      return;
    }
    console.log(`Bundle successfully written to ${outputFile}`);
  });
});