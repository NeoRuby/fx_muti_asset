
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  username: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, username }) => {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">中泰证券</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">固定收益多资产平台</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('duration')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'duration' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3">📊</span>
            债基久期跟踪
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'research' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3">📑</span>
            研究报告展示
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
                {username[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="登出"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === 'duration' ? '债券基金久期跟踪分析' : '精选研究报告'}
          </h2>
          <div className="flex items-center space-x-4">
             <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 uppercase">
               Pro Analyst Mode
             </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
