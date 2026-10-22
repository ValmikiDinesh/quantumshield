import React from 'react';
import { SeverityLevel } from '../../types';

interface Props {
  severity: SeverityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '', size = 'md' }) => {
  const styles: Record<SeverityLevel, { bg: string; text: string; border: string; dot: string; label: string }> = {
    Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-600', label: 'Critical' },
    High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', label: 'High' },
    Medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Medium' },
    Low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-600', label: 'Low' },
    Informational: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600', label: 'Verified PQC' },
  };

  const current = styles[severity] || styles.Informational;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${current.dot}`} />
      {current.label}
    </span>
  );
};
