import { useState } from 'react';
import { AlertCircle, Workflow, Server, Database, GitBranch, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import type { ProjectDetail } from '../../services/projectService';

interface Props { project: ProjectDetail; }

type DiagramKey = 'business' | 'architecture' | 'dataflow' | 'cicd';

interface Node { id: string; label: string; sub?: string; tone: 'brand' | 'success' | 'warn' | 'neutral'; }
interface Edge { from: string; to: string; label?: string; }

const TONE_BG: Record<string, string> = {
  brand:   'bg-brand-500/10 border-brand-500/40 text-brand-700 dark:text-brand-200',
  success: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-200',
  warn:    'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-200',
  neutral: 'bg-slate-500/10 border-slate-400/40 text-slate-700 dark:text-slate-200',
};

// ----------------------------------------------------------------------------
// Simple layered diagram renderer. Nodes are arranged in columns; edges are
// drawn as SVG curves. No external dependency.
// ----------------------------------------------------------------------------
function DiagramCanvas({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  // Assign layers by dependency depth (very simple topological placement)
  const incomingCount = new Map<string, number>();
  nodes.forEach((n) => incomingCount.set(n.id, 0));
  edges.forEach((e) => incomingCount.set(e.to, (incomingCount.get(e.to) || 0) + 1));

  const layers: string[][] = [];
  const placed = new Set<string>();
  let remaining = [...nodes];
  while (remaining.length > 0) {
    const currentLayer: string[] = [];
    let stillRemaining: any[] = [];
    for (const n of remaining) {
      // Node is ready if all its predecessors are already placed
      const preds = edges.filter((e) => e.to === n.id).map((e) => e.from);
      if (preds.every((p) => placed.has(p))) {
        currentLayer.push(n.id);
      } else {
        stillRemaining.push(n);
      }
    }
    if (currentLayer.length === 0) {
      // Cycle or all blocked — just place the rest
      currentLayer.push(...stillRemaining.map((n) => n.id));
      stillRemaining.length = 0;
    }
    currentLayer.forEach((id) => placed.add(id));
    layers.push(currentLayer);
    remaining = stillRemaining;
    if (layers.length > 6) break; // safety
  }

  const NODE_W = 180;
  const NODE_H = 60;
  const GAP_X = 100;
  const GAP_Y = 40;
  const PADDING = 40;

  const positions = new Map<string, { x: number; y: number }>();
  const colHeights = layers.map((l) => l.length * (NODE_H + GAP_Y) - GAP_Y);
  const maxHeight = Math.max(...colHeights, NODE_H);
  layers.forEach((layer, layerIdx) => {
    const startY = PADDING + (maxHeight - colHeights[layerIdx]) / 2;
    layer.forEach((nodeId, nodeIdx) => {
      positions.set(nodeId, {
        x: PADDING + layerIdx * (NODE_W + GAP_X),
        y: startY + nodeIdx * (NODE_H + GAP_Y),
      });
    });
  });

  const svgW = PADDING * 2 + layers.length * NODE_W + (layers.length - 1) * GAP_X;
  const svgH = PADDING * 2 + maxHeight;

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <svg width={svgW} height={svgH} className="block">
        {/* Edges */}
        {edges.map((e, i) => {
          const from = positions.get(e.from);
          const to = positions.get(e.to);
          if (!from || !to) return null;
          const x1 = from.x + NODE_W;
          const y1 = from.y + NODE_H / 2;
          const x2 = to.x;
          const y2 = to.y + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          return (
            <g key={i}>
              <path
                d={'M ' + x1 + ' ' + y1 + ' C ' + midX + ' ' + y1 + ', ' + midX + ' ' + y2 + ', ' + x2 + ' ' + y2}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-slate-400 dark:text-slate-600"
              />
              <polygon
                points={
                  (x2 - 8) + ',' + (y2 - 4) + ' ' +
                  (x2 - 8) + ',' + (y2 + 4) + ' ' +
                  x2 + ',' + y2
                }
                fill="currentColor"
                className="text-slate-400 dark:text-slate-600"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const pos = positions.get(n.id);
          if (!pos) return null;
          return (
            <g key={n.id} transform={'translate(' + pos.x + ',' + pos.y + ')'}>
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={10}
                className={'fill-white dark:fill-slate-900 stroke-2 ' + TONE_BG[n.tone]}
                strokeWidth={1.5}
              />
              <text
                x={NODE_W / 2}
                y={n.sub ? NODE_H / 2 - 4 : NODE_H / 2 + 4}
                textAnchor="middle"
                className="fill-slate-900 dark:fill-slate-100 text-xs font-medium"
                style={{ fontSize: '12px', fontWeight: 500 }}
              >
                {n.label}
              </text>
              {n.sub && (
                <text
                  x={NODE_W / 2}
                  y={NODE_H / 2 + 12}
                  textAnchor="middle"
                  className="fill-slate-500"
                  style={{ fontSize: '10px' }}
                >
                  {n.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function buildDiagrams(p: ProjectDetail): Record<DiagramKey, { nodes: Node[]; edges: Edge[] }> {
  // Business workflow
  const business: { nodes: Node[]; edges: Edge[] } = {
    nodes: [
      { id: 'req', label: 'Requirement', sub: p.client.companyName, tone: 'brand' },
      { id: 'design', label: 'Solution Design', sub: p.projectManager?.fullName || 'PM', tone: 'brand' },
      { id: 'build', label: 'Development', sub: p.members.length + ' engineers', tone: 'brand' },
      { id: 'qa', label: 'QA & Testing', sub: p.qaStatus, tone: 'warn' },
      { id: 'deploy', label: 'Deployment', sub: p.environment, tone: 'success' },
      { id: 'ops', label: 'Support & Ops', sub: p.status, tone: 'neutral' },
    ],
    edges: [
      { from: 'req', to: 'design' },
      { from: 'design', to: 'build' },
      { from: 'build', to: 'qa' },
      { from: 'qa', to: 'deploy' },
      { from: 'deploy', to: 'ops' },
    ],
  };

  // System architecture (derived from tech stack)
  const archNodes: Node[] = [
    { id: 'client', label: 'Client', sub: p.techFrontend[0] || 'Web UI', tone: 'brand' },
  ];
  const archEdges: Edge[] = [];
  if (p.techBackend[0]) {
    archNodes.push({ id: 'api', label: 'API Layer', sub: p.techBackend[0], tone: 'success' });
    archEdges.push({ from: 'client', to: 'api' });
  }
  if (p.techBackend[1]) {
    archNodes.push({ id: 'svc', label: 'Services', sub: p.techBackend[1], tone: 'success' });
    archEdges.push({ from: 'api', to: 'svc' });
  }
  if (p.techDatabase[0]) {
    archNodes.push({ id: 'db', label: 'Database', sub: p.techDatabase[0], tone: 'warn' });
    archEdges.push({ from: 'api', to: 'db' });
  }
  if (p.techCloud[0]) {
    archNodes.push({ id: 'cloud', label: 'Cloud Platform', sub: p.techCloud[0], tone: 'neutral' });
    archEdges.push({ from: 'svc', to: 'cloud' });
  }
  if (p.integrations.length > 0) {
    archNodes.push({ id: 'ext', label: 'Integrations', sub: p.integrations.length + ' external', tone: 'neutral' });
    archEdges.push({ from: 'svc', to: 'ext' });
  }
  const architecture = { nodes: archNodes, edges: archEdges };

  // Data flow
  const dataflow: { nodes: Node[]; edges: Edge[] } = {
    nodes: [
      { id: 'input', label: 'Input', sub: 'User / System', tone: 'brand' },
      { id: 'validate', label: 'Validation', sub: 'Schema + rules', tone: 'brand' },
      { id: 'process', label: 'Processing', sub: p.techBackend[0] || 'Service layer', tone: 'success' },
      { id: 'store', label: 'Persistence', sub: p.techDatabase[0] || 'PostgreSQL', tone: 'warn' },
      { id: 'response', label: 'Response', sub: 'API / UI', tone: 'neutral' },
    ],
    edges: [
      { from: 'input', to: 'validate' },
      { from: 'validate', to: 'process' },
      { from: 'process', to: 'store' },
      { from: 'store', to: 'response' },
    ],
  };

  // CI/CD
  const cicd: { nodes: Node[]; edges: Edge[] } = {
    nodes: [
      { id: 'commit', label: 'Commit', sub: 'Git push', tone: 'brand' },
      { id: 'build', label: 'Build', sub: 'CI runner', tone: 'brand' },
      { id: 'test', label: 'Tests', sub: p.qaStatus, tone: 'warn' },
      { id: 'scan', label: 'Security Scan', sub: p.securityStatus, tone: 'warn' },
      { id: 'stage', label: 'Deploy to Stage', sub: 'STAGING', tone: 'success' },
      { id: 'prod', label: 'Deploy to Prod', sub: p.environment, tone: 'success' },
    ],
    edges: [
      { from: 'commit', to: 'build' },
      { from: 'build', to: 'test' },
      { from: 'test', to: 'scan' },
      { from: 'scan', to: 'stage' },
      { from: 'stage', to: 'prod' },
    ],
  };

  return { business, architecture, dataflow, cicd };
}

export default function ProjectFlowchartTab({ project }: Props) {
  const diagrams = buildDiagrams(project);
  const [active, setActive] = useState<DiagramKey>('business');

  const tabs = [
    { key: 'business' as DiagramKey,     label: 'Business Workflow' },
    { key: 'architecture' as DiagramKey, label: 'System Architecture' },
    { key: 'dataflow' as DiagramKey,     label: 'Data Flow' },
    { key: 'cicd' as DiagramKey,         label: 'CI / CD Pipeline' },
  ];

  return (
    <div className="space-y-5">
      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Architecture example.</strong> These diagrams illustrate typical patterns for a project of this
            technology profile. They are generated from the project's stored metadata — not from a live architecture tool.
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      <Card>
        <CardHeader
          title={tabs.find((t) => t.key === active)?.label || ''}
          subtitle={diagrams[active].nodes.length + ' nodes · ' + diagrams[active].edges.length + ' connections'}
        />
        <DiagramCanvas nodes={diagrams[active].nodes} edges={diagrams[active].edges} />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Workflow size={14} /> Nodes: orange = data, green = services, blue = client
        </div>
      </Card>
    </div>
  );
}