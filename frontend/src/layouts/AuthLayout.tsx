import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 text-white p-6">
      <div className="w-full max-w-md">
        {children}
        <p className="mt-6 text-center text-xs text-slate-400">
          Nexus Enterprise Platform &middot; FINTECH IT SOLUTIONS
        </p>
      </div>
    </div>
  );
}