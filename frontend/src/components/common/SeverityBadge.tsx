import React from 'react';
import { SeverityLevel } from '../../types';

interface Props {
  severity: SeverityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '', size = 'md' }) => {
  const styles: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
    Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    Medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    Low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Informational: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  };

  const current = styles[severity] || styles.Informational;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        severity === 'Critical' ? 'bg-red-600' :
        severity === 'High' ? 'bg-orange-500' :
        severity === 'Medium' ? 'bg-amber-500' :
        severity === 'Low' ? 'bg-blue-600' : 'bg-slate-500'
      }`} />
      {severity}
    </span>
  );
};
