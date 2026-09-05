import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'progreso', label: 'Estadísticas', icon: 'bar_chart' },
    { id: 'nutricion', label: 'Nutrición', icon: 'restaurant' },
    { id: 'max-ai', label: 'MAX AI', icon: 'auto_awesome', isSpecial: true },
    { id: 'retos', label: 'Retos', icon: 'emoji_events' },
    { id: 'perfil', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe dark:bg-[#191c20]/95 bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.6)] border-t dark:border-[#282a2f] border-slate-200 transition-colors duration-200">
      <div className="flex justify-between items-center h-16 px-1 max-w-[1280px] mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id || (tab.id === 'progreso' && currentTab === 'estadisticas');

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all group active:scale-95"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                  isActive 
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/40' 
                    : 'dark:bg-[#2563eb]/20 bg-blue-100 text-[#2563eb] dark:text-[#b4c5ff] group-hover:bg-[#2563eb]/30'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {tab.icon}
                  </span>
                </div>
                <span className={`font-body-sm text-[11px] leading-none mt-1 font-semibold ${
                  isActive ? 'text-[#2563eb] dark:text-[#b4c5ff]' : 'text-slate-500 dark:text-[#b4c5ff]/80'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors gap-1 ${
                isActive ? 'text-[#2563eb] dark:text-[#b4c5ff] font-semibold' : 'text-slate-500 dark:text-[#c3c6d7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${
                isActive ? 'text-[#2563eb] dark:text-[#b4c5ff]' : 'text-slate-400 dark:text-[#8d90a0]'
              }`}>
                {tab.icon}
              </span>
              <span className="font-body-sm text-[11px] leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
