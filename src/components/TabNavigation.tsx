import React from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  BarChart2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export type TabType = 'overview' | 'participants' | 'milestones' | 'analytics';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  participantCount: number;
  currentTierName: string;
  snapshotCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  participantCount,
  currentTierName,
  snapshotCount,
}) => {
  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: snapshotCount > 0 ? `${snapshotCount} Snapshots` : undefined,
    },
    {
      id: 'participants',
      label: 'Data Peserta',
      icon: <Users className="w-4 h-4" />,
      badge: participantCount > 0 ? `${participantCount}` : undefined,
    },
    {
      id: 'milestones',
      label: 'Milestone Facilitator',
      icon: <Award className="w-4 h-4" />,
      badge: currentTierName,
    },
    {
      id: 'analytics',
      label: 'Grafik & Analisis',
      icon: <BarChart2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 sticky top-[61px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-blue-800/80 text-blue-100'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
