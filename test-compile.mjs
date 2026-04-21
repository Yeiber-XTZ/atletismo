import { transform } from '@astrojs/compiler';
import * as fs from 'fs';

async function check() {
  const code = fs.readFileSync('src/pages/admin/index.astro', 'utf8');
  try {
    const result = await transform(code, { internalURL: 'astro/internal' });
    fs.writeFileSync('test-out.ts', result.code);
    console.log("Transformed to test-out.ts");
  } catch (err) {
    console.error(err);
  }
}
check();
