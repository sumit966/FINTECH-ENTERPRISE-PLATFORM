import { useState } from 'react';
import { AlertCircle, File, Folder, FileCode, FileJson, FileText, GitBranch, Terminal, Play, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { ProjectDetail } from '../../services/projectService';

interface Props { project: ProjectDetail; }

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileNode[];
  content?: string;
}

function buildTree(p: ProjectDetail): FileNode[] {
  const frontendExt = p.techFrontend.includes('React') || p.techFrontend.includes('Next.js') ? 'tsx' : 'ts';
  const backendExt = p.techBackend.includes('Python') || p.techBackend.includes('FastAPI') ? 'py' : 'ts';
  const hasAI = p.techAI.length > 0;

  return [
    {
      name: 'src', type: 'folder', children: [
        {
          name: 'components', type: 'folder', children: [
            { name: 'Header.' + frontendExt, type: 'file', language: frontendExt, content: 'export default function Header() {\n  return <header className="app-header">\n    <h1>' + p.name + '</h1>\n  </header>;\n}\n' },
            { name: 'Layout.' + frontendExt, type: 'file', language: frontendExt, content: 'export default function Layout({ children }) {\n  return <main className="app-main">{children}</main>;\n}\n' },
          ],
        },
        {
          name: 'pages', type: 'folder', children: [
            { name: 'Dashboard.' + frontendExt, type: 'file', language: frontendExt, content: 'export default function Dashboard() {\n  return <div>\n    <h2>' + p.name + ' Dashboard</h2>\n  </div>;\n}\n' },
          ],
        },
        {
          name: 'services', type: 'folder', children: [
            { name: 'api.' + backendExt, type: 'file', language: backendExt, content: p.techBackend.includes('Python') ? 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/api/health")\ndef health():\n    return {"status": "ok"}\n' : "import express from 'express';\n\nconst app = express();\n\napp.get('/api/health', (_req, res) => {\n  res.json({ status: 'ok' });\n});\n\nexport default app;\n" },
            ...(hasAI ? [{ name: 'ml.' + backendExt, type: 'file' as const, language: backendExt, content: p.techBackend.includes('Python') ? 'def predict(features):\n    # model inference stub\n    return {"score": 0.87}\n' : '// ML integration stub\nexport function predict(features: unknown) {\n  return { score: 0.87 };\n}\n' }] : []),
          ],
        },
        {
          name: 'utils', type: 'folder', children: [
            { name: 'format.' + backendExt, type: 'file', language: backendExt, content: p.techBackend.includes('Python') ? 'def format_currency(value: float) -> str:\n    return f"Rs {value:,.2f}"\n' : "export function formatCurrency(value: number): string {\n  return 'Rs ' + value.toLocaleString('en-IN');\n}\n" },
          ],
        },
      ],
    },
    { name: 'package.json', type: 'file', language: 'json', content: '{\n  "name": "' + p.projectCode.toLowerCase() + '",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "test": "vitest"\n  }\n}\n' },
    { name: 'README.md', type: 'file', language: 'markdown', content: '# ' + p.name + '\n\nSee the README tab for full documentation.\n' },
    { name: '.env.example', type: 'file', language: 'env', content: 'DATABASE_URL=postgresql://...\nAPI_BASE_URL=https://api.example.in\nJWT_SECRET=changeme\n' },
  ];
}

function findFile(nodes: FileNode[], path: string[]): FileNode | null {
  if (path.length === 0) return null;
  const [head, ...rest] = path;
  for (const n of nodes) {
    if (n.name === head) {
      if (rest.length === 0) return n;
      return n.children ? findFile(n.children, rest) : null;
    }
  }
  return null;
}

function fileIcon(name: string) {
  if (name.endsWith('.json')) return <FileJson size={14} className="text-amber-500" />;
  if (name.endsWith('.md')) return <FileText size={14} className="text-slate-400" />;
  if (name.startsWith('.')) return <File size={14} className="text-slate-400" />;
  return <FileCode size={14} className="text-brand-500" />;
}

export default function ProjectDevWorkspaceTab({ project }: Props) {
  const tree = buildTree(project);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['src', 'src/components', 'src/services']));
  const [selectedPath, setSelectedPath] = useState<string[]>(['src', 'components', 'Header.' + (project.techFrontend.includes('React') ? 'tsx' : 'ts')]);

  const selectedFile = findFile(tree, selectedPath);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderNode = (node: FileNode, parentPath: string[] = [], depth: number = 0) => {
    const path = [...parentPath, node.name];
    const pathKey = path.join('/');
    const isOpen = openFolders.has(pathKey);
    const isSelected = selectedPath.join('/') === pathKey;

    if (node.type === 'folder') {
      return (
        <div key={pathKey}>
          <button
            onClick={() => toggleFolder(pathKey)}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
            style={{ paddingLeft: (8 + depth * 12) + 'px' }}
          >
            <Folder size={12} className={isOpen ? 'text-brand-500' : 'text-slate-400'} />
            <span className="font-medium">{node.name}</span>
          </button>
          {isOpen && node.children?.map((c) => renderNode(c, path, depth + 1))}
        </div>
      );
    }

    return (
      <button
        key={pathKey}
        onClick={() => setSelectedPath(path)}
        className={
          'w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs ' +
          (isSelected
            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 font-medium'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300')
        }
        style={{ paddingLeft: (8 + depth * 12 + 16) + 'px' }}
      >
        {fileIcon(node.name)}
        <span className="truncate">{node.name}</span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Editor only — code execution requires a secure sandbox (Integration Required).</strong>{' '}
            The file tree and code shown below are prototype examples derived from this project's technology stack.
            No code is executed here. To add real compilation, integrate a sandbox service (e.g. Judge0, Piston, AWS Lambda container, or a dedicated execution host).
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File tree */}
        <Card className="lg:col-span-1" padded={false}>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
              <Folder size={12} /> Project Files
            </div>
          </div>
          <div className="p-2 max-h-[600px] overflow-y-auto">
            {tree.map((n) => renderNode(n))}
          </div>
        </Card>

        {/* Code viewer */}
        <div className="lg:col-span-3 space-y-4">
          <Card padded={false}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode size={14} className="text-brand-500 shrink-0" />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                  {selectedPath.join('/')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{selectedFile?.language || 'text'}</Badge>
              </div>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200">
              {selectedFile?.content || '// Select a file from the tree to view its contents.'}
            </pre>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Build Status" subtitle="From project records" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Environment</span>
                  <Badge tone="brand">{project.environment}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">QA Status</span>
                  <Badge tone={project.qaStatus === 'PASS' ? 'success' : 'warn'}>{project.qaStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Security</span>
                  <Badge tone={project.securityStatus === 'PASS' ? 'success' : 'danger'}>{project.securityStatus}</Badge>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Repository" subtitle="Linked source location" />
              {project.repository ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-slate-400" />
                    <a href={project.repository} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline truncate">
                      {project.repository}
                    </a>
                  </div>
                  <div className="text-xs text-slate-500">
                    View source and PR history in the Engineering module.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No repository linked to this project.</div>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader title="Execution Service" subtitle="Integration required for real code execution" />
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="text-xs">
                The editor above is display-only. Running code requires a secure, isolated execution sandbox.
                Recommended options:
              </p>
              <ul className="text-xs list-disc list-inside space-y-1 text-slate-500">
                <li><strong>Judge0</strong> — self-hosted or cloud code execution API</li>
                <li><strong>Piston</strong> — lightweight sandbox for many languages</li>
                <li><strong>AWS Lambda</strong> — container-based execution with strict IAM scoping</li>
                <li><strong>E2B</strong> — sandboxed developer environments</li>
              </ul>
              <p className="text-xs text-slate-500">
                Wire the endpoint of your chosen service into the backend and expose a <code className="font-mono">POST /api/projects/:code/execute</code> route. Until then, this tab remains editor-only by design.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}