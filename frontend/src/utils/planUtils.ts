export function formatPlanName(plan?: string): string {
  switch (plan) {
    case 'single_scan':
      return 'Single Scan';
    case 'developer':
      return 'Developer Pro';
    case 'team':
      return 'Team Security';
    case 'enterprise':
      return 'Enterprise Shield';
    case 'free':
    default:
      return 'Free Tier';
  }
}

export function getPlanBadgeDetails(plan?: string): {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBg: string;
  description: string;
} {
  switch (plan) {
    case 'enterprise':
      return {
        name: 'Enterprise Shield',
        badgeBg: 'bg-purple-50',
        badgeText: 'text-purple-700',
        badgeBorder: 'border-purple-200',
        accentBg: 'bg-purple-600',
        description: '500 Projects • 5,000 Scans / month • Custom SAST Rules & SLA',
      };
    case 'team':
      return {
        name: 'Team Security',
        badgeBg: 'bg-indigo-50',
        badgeText: 'text-indigo-700',
        badgeBorder: 'border-indigo-200',
        accentBg: 'bg-indigo-600',
        description: '50 Projects • 300 Scans / month • SOC 2 & Multi-User RBAC',
      };
    case 'single_scan':
      return {
        name: 'Single Scan',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-200',
        accentBg: 'bg-amber-600',
        description: '1 Full Repository Audit Pass • Dual-Shield Catalog & PDF Export',
      };
    case 'developer':
      return {
        name: 'Developer Pro',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-brand-700',
        badgeBorder: 'border-blue-200',
        accentBg: 'bg-brand-600',
        description: '10 Projects • 75 Scans / month • AI Security Advisor & Diff History',
      };
    case 'free':
    default:
      return {
        name: 'Free Community',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-200',
        accentBg: 'bg-slate-600',
        description: 'Community Evaluation • 1 Project • 3 Scans / month',
      };
  }
}

