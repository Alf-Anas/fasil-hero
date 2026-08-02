import React, { useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type TabType = 'overview' | 'participants' | 'milestones' | 'analytics' | 'settings';

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
  const navRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
    {
      id: 'settings',
      label: 'Pengaturan Project',
      icon: <Settings className="w-4 h-4 text-blue-400" />,
    },
  ];

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 sticky top-[61px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative">
        <div className="flex items-center">
          <button
            onClick={() => scroll('left')}
            className="sm:hidden p-1 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg shrink-0 mr-1 z-10 cursor-pointer"
            title="Scroll kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <nav
            ref={navRef}
            className="flex items-center gap-1.5 overflow-x-auto py-2.5 w-full no-scrollbar touch-pan-x overscroll-x-contain min-w-0 scroll-smooth"
            aria-label="Tabs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#fbbc04] text-slate-950 shadow-md shadow-[#fbbc04]/20 font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
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

          <button
            onClick={() => scroll('right')}
            className="sm:hidden p-1 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg shrink-0 ml-1 z-10 cursor-pointer"
            title="Scroll kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
