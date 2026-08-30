import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function renderSvgToPng(svgPath, pngPath, options = {}) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: options.fitTo || { mode: 'original' },
    ...options
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`✓ Rendered ${path.relative(rootDir, pngPath)} (${pngBuffer.length} bytes)`);
}

// 1. Root assets
renderSvgToPng(
  path.join(rootDir, 'assets/homura-banner.svg'),
  path.join(rootDir, 'assets/homura-banner.png'),
  { fitTo: { mode: 'width', value: 1544 } }
);

renderSvgToPng(
  path.join(rootDir, 'assets/homura-icon.svg'),
  path.join(rootDir, 'assets/homura-icon.png'),
  { fitTo: { mode: 'width', value: 512 } }
);

// 2. WordPress plugin assets
renderSvgToPng(
  path.join(rootDir, 'examples/wordpress-plugin/assets/banner-772x250.svg'),
  path.join(rootDir, 'examples/wordpress-plugin/assets/banner-772x250.png'),
  { fitTo: { mode: 'width', value: 772 } }
);

renderSvgToPng(
  path.join(rootDir, 'examples/wordpress-plugin/assets/banner-1544x500.svg'),
  path.join(rootDir, 'examples/wordpress-plugin/assets/banner-1544x500.png'),
  { fitTo: { mode: 'width', value: 1544 } }
);

renderSvgToPng(
  path.join(rootDir, 'examples/wordpress-plugin/assets/icon.svg'),
  path.join(rootDir, 'examples/wordpress-plugin/assets/icon-256x256.png'),
  { fitTo: { mode: 'width', value: 256 } }
);

renderSvgToPng(
  path.join(rootDir, 'examples/wordpress-plugin/assets/icon.svg'),
  path.join(rootDir, 'examples/wordpress-plugin/assets/icon-128x128.png'),
  { fitTo: { mode: 'width', value: 128 } }
);

console.log('\n🎉 All vector SVG assets cleanly rendered to crisp PNGs!\n');
