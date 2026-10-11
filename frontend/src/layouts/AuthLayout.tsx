import { ReactNode } from 'react';
import HeroBackground from '../components/layout/HeroBackground';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen grid place-items-center text-slate-100 p-6">
      <div className="absolute inset-0 -z-10">
        <HeroBackground height="100%" />
      </div>
      <div className="w-full max-w-md relative z-10">
        {children}
        <p className="mt-6 text-center text-xs text-slate-400">
          Nexus Enterprise Platform &middot; FINTECH IT SOLUTIONS
        </p>
      </div>
    </div>
  );
}
