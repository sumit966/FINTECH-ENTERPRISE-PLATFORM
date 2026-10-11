const fs = require('fs');
const p = 'src/pages/settings/SettingsPage.tsx';
let s = fs.readFileSync(p, 'utf8');

// Prepend required imports after the first import line, or at the very top if no import exists
const needed = [
  "import { useTheme } from '../../context/ThemeContext';",
  "import { Sun, Moon, Monitor, Sparkles } from 'lucide-react';",
];

for (const line of needed) {
  if (!s.includes(line.split(' from ')[0])) {
    // insert after the first import line
    const firstImportEnd = s.indexOf('\n', s.indexOf('import'));
    s = s.slice(0, firstImportEnd + 1) + line + '\n' + s.slice(firstImportEnd + 1);
  }
}

fs.writeFileSync(p, s);
console.log('SettingsPage imports fixed');
