import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, ChevronDown, Users, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { orgChartService, OrgNode } from '../../services/orgChartService';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Colour-code by gender for a subtle visual hint. Kept neutral.
const AVATAR_CLASS_BY_GENDER: Record<string, string> = {
  MALE: 'bg-brand-500/15 text-brand-600 dark:text-brand-300',
  FEMALE: 'bg-pink-500/15 text-pink-600 dark:text-pink-300',
  OTHER: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  UNDISCLOSED: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
};

interface NodeProps {
  node: OrgNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  search: string;
  onSelect: (node: OrgNode) => void;
  selectedId: string | null;
}

function TreeNode({ node, depth, expanded, onToggle, search, onSelect, selectedId }: NodeProps) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.reports.length > 0;

  // Search highlight: when searching, force-expand matches in the path
  const searching = search.trim().length > 0;
  const q = search.toLowerCase();
  const directMatch = searching && (node.fullName.toLowerCase().includes(q) || node.employeeCode.toLowerCase().includes(q));

  const childMatches = useMemo(() => {
    if (!searching) return false;
    function hasMatch(n: OrgNode): boolean {
      if (n.fullName.toLowerCase().includes(q) || n.employeeCode.toLowerCase().includes(q)) return true;
      return n.reports.some(hasMatch);
    }
    return node.reports.some(hasMatch);
  }, [searching, q, node]);

  // If searching, hide nodes that don't match and don't contain matches
  if (searching && !directMatch && !childMatches) return null;

  const showChildren = hasChildren && (isExpanded || (searching && childMatches));

  return (
    <div className="relative">
      <div
        className={
          'group flex items-center gap-2 rounded-lg border px-3 py-2 transition cursor-pointer ' +
          (selectedId === node.id
            ? 'border-brand-500 bg-brand-500/5'
            : directMatch
            ? 'border-amber-500/60 bg-amber-500/5'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400')
        }
        style={{ marginLeft: depth * 24 }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {showChildren ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <div className={'h-8 w-8 rounded-full grid place-items-center text-xs font-semibold shrink-0 ' + (AVATAR_CLASS_BY_GENDER[node.gender] || AVATAR_CLASS_BY_GENDER.UNDISCLOSED)}>
          {initials(node.fullName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{node.fullName}</div>
          <div className="text-[11px] text-slate-500 truncate">
            {node.employeeCode} &middot; {node.departmentName} &middot; {node.locationCity}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge tone="brand">{node.designation}</Badge>
          {hasChildren && (
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Users size={11} /> {node.directReportCount}
            </span>
          )}
        </div>
      </div>

      {showChildren && (
        <div className="mt-1 space-y-1">
          {node.reports.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              search={search}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [roots, setRoots] = useState<OrgNode[]>([]);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<OrgNode | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 250);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await orgChartService.tree();
      setRoots(r.roots);
      setTotal(r.totalNodes);
      // Auto-expand founder and first level
      const auto = new Set<string>();
      r.roots.forEach((root) => {
        auto.add(root.id);
        root.reports.slice(0, 6).forEach((c) => auto.add(c.id));
      });
      setExpanded(auto);
    } catch (e: any) {
      setError(e?.message || 'Failed to load org chart');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organisation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Reporting hierarchy across {total} active employees &middot; click a card to see details
        </p>
      </div>

      <Card padded={false} className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees in the hierarchy"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button
            onClick={() => {
              const all = new Set<string>();
              function walk(n: OrgNode) { all.add(n.id); n.reports.forEach(walk); }
              roots.forEach(walk);
              setExpanded(all);
            }}
            className="text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 hover:border-brand-500"
          >
            Expand all
          </button>
          <button
            onClick={() => setExpanded(new Set())}
            className="text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 hover:border-brand-500"
          >
            Collapse all
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="space-y-2">
            {roots.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                depth={0}
                expanded={expanded}
                onToggle={toggle}
                search={searchDeb}
                onSelect={setSelected}
                selectedId={selected?.id || null}
              />
            ))}
          </div>
        </Card>

        <div>
          {selected ? (
            <Card className="sticky top-20">
              <div className="flex items-start gap-3">
                <div className={'h-14 w-14 rounded-full grid place-items-center text-lg font-semibold ' + (AVATAR_CLASS_BY_GENDER[selected.gender] || AVATAR_CLASS_BY_GENDER.UNDISCLOSED)}>
                  {initials(selected.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg truncate">{selected.fullName}</div>
                  <div className="text-xs text-slate-500 font-mono">{selected.employeeCode}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin size={11} /> {selected.locationCity}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-right">{selected.departmentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Grade</span>
                  <Badge tone="brand">{selected.designation}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Direct reports</span>
                  <span className="font-medium">{selected.directReportCount}</span>
                </div>
              </div>

              <Link
                to={'/employees/' + selected.id}
                className="mt-4 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
              >
                Open full profile &rarr;
              </Link>

              {selected.reports.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Direct reports ({selected.reports.length})
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {selected.reports.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="w-full text-left rounded-md border border-slate-200 dark:border-slate-800 px-2 py-1.5 hover:border-brand-500 transition"
                      >
                        <div className="text-sm font-medium truncate">{r.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.employeeCode}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center text-sm text-slate-500 py-12">
                Click any employee in the hierarchy to see their details.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}