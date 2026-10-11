const fs = require('fs');
const p = 'frontend/src/pages/projects/ProjectsPage.tsx';
let s = fs.readFileSync(p, 'utf8');

// Add sort param read
if (!s.includes("params.get('sort')")) {
  s = s.replace(
    "const searchFromUrl = params.get('q') || '';",
    "const searchFromUrl = params.get('q') || '';\n  const sortFromUrl = params.get('sort') || '';"
  );
  // Apply client-side sort when sort=risk
  s = s.replace(
    "const [data, setData] = useState<ProjectListItem[]>([]);",
    "const [data, setDataRaw] = useState<ProjectListItem[]>([]);\n  const setData = (items: ProjectListItem[]) => {\n    if (sortFromUrl === 'risk') {\n      const sorted = [...items].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));\n      setDataRaw(sorted);\n    } else if (sortFromUrl === 'profit') {\n      const sorted = [...items].sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0));\n      setDataRaw(sorted);\n    } else {\n      setDataRaw(items);\n    }\n  };"
  );
  fs.writeFileSync(p, s);
  console.log('ProjectsPage: sort param wired');
} else {
  console.log('ProjectsPage: already has sort param');
}
