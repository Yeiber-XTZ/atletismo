const { parse } = require('@astrojs/compiler');
const fs = require('fs');

async function check() {
  const code = fs.readFileSync('src/pages/admin/index.astro', 'utf8');
  try {
    const result = await parse(code);
    console.log("Parse succeeded?");
  } catch (err) {
    console.error(err);
  }
}
check();
