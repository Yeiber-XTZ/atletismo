const fs = require('fs');
const lines = fs.readFileSync('test-out.ts', 'utf8').split('\n');

const stack = [];
for (let r = 0; r < lines.length; r++) {
  const line = lines[r];
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '{') {
      stack.push({ r: r + 1, c: c + 1 });
    } else if (char === '}') {
      const top = stack.pop();
      if (r + 1 === 2637) {
        console.log(`The } at line 2637 was opened at line ${top.r}, col ${top.c}`);
        console.log(`Opening line content: ${lines[top.r - 1]}`);
        process.exit(0);
      }
    }
  }
}
