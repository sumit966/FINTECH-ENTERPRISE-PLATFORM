const fs = require('fs');
const p = 'frontend/src/components/project-tabs/ProjectFlowchartTab.tsx';
let s = fs.readFileSync(p, 'utf8');

const before = `    if (currentLayer.length === 0) {
      // Cycle or all blocked - just place the rest
      currentLayer.push(...stillRemaining.map((n) => n.id));
      let stillRemaining = [];
    }`;

const beforeAlt = `    if (currentLayer.length === 0) {
      // Cycle or all blocked \u00e2\u20ac\u201d just place the rest
      currentLayer.push(...stillRemaining.map((n) => n.id));
      let stillRemaining = [];
    }`;

const after = `    if (currentLayer.length === 0) {
      // Cycle or all blocked - just place the rest
      currentLayer.push(...stillRemaining.map((n) => n.id));
      stillRemaining.length = 0;
    }`;

const afterAlt = `    if (currentLayer.length === 0) {
      // Cycle or all blocked \u00e2\u20ac\u201d just place the rest
      currentLayer.push(...stillRemaining.map((n) => n.id));
      stillRemaining.length = 0;
    }`;

if (s.includes(before)) {
  s = s.replace(before, after);
  console.log('P1 replaced (ascii comment)');
} else if (s.includes(beforeAlt)) {
  s = s.replace(beforeAlt, afterAlt);
  console.log('P1 replaced (em-dash comment)');
} else {
  // Last-resort: regex on the two lines that matter
  const re = /(\n\s*currentLayer\.push\(\.\.\.stillRemaining\.map\(\(n\) => n\.id\)\);\s*\n)\s*let\s+stillRemaining\s*=\s*\[\];/;
  if (re.test(s)) {
    s = s.replace(re, '$1      stillRemaining.length = 0;');
    console.log('P1 replaced (regex fallback)');
  } else {
    console.log('P1 FAILED: target not found. Dumping lines 44-58:');
    const lines = s.split('\n');
    for (let i = 43; i < 58 && i < lines.length; i++) console.log((i + 1) + ': ' + lines[i]);
  }
}

fs.writeFileSync(p, s);
console.log('P1 wrote', p);
