import { ReactNode } from 'react';
import { Card } from './Card';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export default function Toolbar({ children, className }: ToolbarProps) {
  return (
    <Card padded={false} className={'p-3 ' + (className || '')}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">{children}</div>
    </Card>
  );
}