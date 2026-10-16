import React from 'react';
import { ReadinessAssessment } from '../../types';

interface Props {
  score: number;
  riskLevel: ReadinessAssessment['riskLevel'];
  size?: 'sm' | 'md' | 'lg';
}

export const ReadinessScoreGauge: React.FC<Props> = ({ score, riskLevel, size = 'md' }) => {
  let badgeColor = 'bg-emerald-500 text-white';
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';

  if (score < 40) {
    badgeColor = 'bg-red-600 text-white';
    barColor = 'bg-red-600';
    textColor = 'text-red-700';
  } else if (score < 65) {
    badgeColor = 'bg-orange-500 text-white';
    barColor = 'bg-orange-500';
    textColor = 'text-orange-700';
  } else if (score < 85) {
    badgeColor = 'bg-amber-500 text-white';
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-baseline space-x-1">
          <span className={`font-extrabold tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-3xl'} ${textColor}`}>
            {score}
          </span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
          {riskLevel}
        </span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
    </div>
  );
};
