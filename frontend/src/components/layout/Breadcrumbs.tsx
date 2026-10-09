import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500">
      <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-200">Home</Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight size={12} />
            {isLast ? (
              <span className="text-slate-700 dark:text-slate-200">{label}</span>
            ) : (
              <Link to={path} className="hover:text-slate-700 dark:hover:text-slate-200">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}