import React from 'react';
import { AlgorithmInventoryItem } from '../../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, Info } from 'lucide-react';

interface Props {
  inventory: AlgorithmInventoryItem[];
}

export const AlgorithmInventoryTable: React.FC<Props> = ({ inventory }) => {
  if (!inventory || inventory.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-800">No Cryptographic Primitives Identified</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          The scanner did not detect known classical or post-quantum cryptographic primitives in the inspected source files.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
            Discovered Cryptographic Algorithms & Primitives
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Classified by mathematical quantum impact (Shor's factoring/discrete log vs Grover's search)
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">
          {inventory.length} primitives cataloged
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-6">Algorithm</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Quantum Status</th>
              <th className="py-3 px-4">Occurrences</th>
              <th className="py-3 px-6">Recommended Action / Replacement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item, idx) => {
              let statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Shor Vulnerable
                </span>
              );

              if (item.quantumStatus === 'quantum-resistant') {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Quantum Resistant
                  </span>
                );
              } else if (item.quantumStatus === 'safe-grover-impact') {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Info className="w-3 h-3 mr-1" />
                    Grover Impact (256-bit safe)
                  </span>
                );
              } else if (item.quantumStatus === 'legacy-insecure') {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                    <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                    Conventionally Insecure
                  </span>
                );
              }

              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {item.algorithm}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[11px] font-medium text-slate-500">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4">
                    {statusBadge}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {item.locationsCount} file{item.locationsCount > 1 ? 's' : ''}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {item.recommendedReplacement ? (
                      <div className="flex items-center space-x-1.5 text-blue-700 font-medium">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-brand-600" />
                        <span>{item.recommendedReplacement}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Standardize & monitor FIPS revisions</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
