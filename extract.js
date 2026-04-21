const fs = require('fs');
const lines = fs.readFileSync('test-out.ts', 'utf8').split('\n');
fs.writeFileSync('ast-snippet.txt', lines.slice(-40).join('\n'));
