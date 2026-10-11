import { useState } from 'react';
import { Play, AlertCircle, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { projectService } from '../../services/projectService';

const LANGS = [
  { key: 'javascript', label: 'JavaScript', sample: `console.log('Hello from JS');\n` },
  { key: 'typescript', label: 'TypeScript', sample: `const msg: string = 'Hello from TS';\nconsole.log(msg);\n` },
  { key: 'python',     label: 'Python',     sample: `print('Hello from Python')\n` },
  { key: 'sql',        label: 'SQL',        sample: `SELECT 1 AS hello;\n` },
];

interface RunResult {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  timeMs?: number;
  error?: string;
  code?: string;
}

export default function ProjectCompilerTab({ projectCode }: { projectCode: string }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGS[0].sample);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const onLangChange = (key: string) => {
    setLanguage(key);
    const lang = LANGS.find((l) => l.key === key);
    if (lang) setCode(lang.sample);
    setResult(null);
  };

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const r: any = await projectService.execute(code, language);
      setResult(r);
    } catch (e: any) {
      setResult({ error: e?.message || 'Run failed', code: e?.code });
    } finally {
      setRunning(false);
    }
  };

  const isIntegrationRequired = result?.code === 'INTEGRATION_REQUIRED';

  return (
    <div className="space-y-5">
      <Card className="border-amber-500/30 bg-amber-500/5 card-hover">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Execution requires a secure sandbox.</strong> This editor sends your code to the backend,
            which forwards it to an isolated execution service (Judge0, Piston, E2B, AWS Lambda, etc.).
            It is <em>never</em> run inside this application's server process. Until the backend is configured with{' '}
            <code className="font-mono">EXECUTION_SERVICE_URL</code> in <code className="font-mono">backend/.env</code>, the Run
            button returns <strong>INTEGRATION_REQUIRED</strong> and no code is executed.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-hover" padded={false}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-brand-500" />
              <span className="text-xs font-medium">editor · {projectCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => onLangChange(e.target.value)}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              >
                {LANGS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
              <Button size="sm" onClick={run} loading={running}>
                <Play size={12} /> Run
              </Button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={18}
            className="w-full font-mono text-xs p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none resize-y"
            style={{ minHeight: 320 }}
          />
        </Card>

        <Card className="lg:col-span-1 card-hover" padded={false}>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <span className="text-xs font-medium">output</span>
            {result && !result.error && !isIntegrationRequired && (
              result.exitCode === 0
                ? <Badge tone="success"><CheckCircle2 size={11} /> exit 0</Badge>
                : <Badge tone="danger"><XCircle size={11} /> exit {result.exitCode}</Badge>
            )}
          </div>
          <div className="p-4 text-xs font-mono whitespace-pre-wrap min-h-[320px] bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200">
            {!result && <span className="text-slate-400">Press Run to execute (or click Run to see the integration status).</span>}
            {isIntegrationRequired && (
              <div className="text-amber-600 dark:text-amber-400">
                {result?.error || 'Execution backend not configured.'}
                {'\n\n'}Set <code>EXECUTION_SERVICE_URL</code> in <code>backend/.env</code> to enable execution.
              </div>
            )}
            {result && !isIntegrationRequired && result.error && (
              <div className="text-rose-600 dark:text-rose-400">{result.error}</div>
            )}
            {result && !isIntegrationRequired && !result.error && (
              <>
                {result.stdout && <div>{result.stdout}</div>}
                {result.stderr && <div className="text-rose-600 dark:text-rose-400 mt-2">{result.stderr}</div>}
                {result.timeMs != null && (
                  <div className="text-slate-400 mt-3">took {result.timeMs} ms</div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
