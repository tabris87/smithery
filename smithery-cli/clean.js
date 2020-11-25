const fs = require('fs');
const tsconf = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));

fs.rmdirSync(tsconf.compilerOptions.outDir, { recursive: true });