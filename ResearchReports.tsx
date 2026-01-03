
import React from 'react';
import { RESEARCH_REPORTS } from '../constants';

const ResearchReports: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {RESEARCH_REPORTS.map((report, idx) => (
        <a 
          key={idx}
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-widest">
              Research Note
            </span>
            <span className="text-xs text-slate-400">{report.date}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug mb-4">
            {report.title}
          </h3>
          <div className="flex items-center text-sm font-medium text-blue-500 group-hover:translate-x-1 transition-transform">
            阅读全文 
            <span className="ml-1">→</span>
          </div>
        </a>
      ))}
      
      {/* Empty State placeholder if needed */}
      <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
        <span className="text-4xl mb-2">🔭</span>
        <p className="text-sm font-medium">更多研报正在整理中...</p>
      </div>
    </div>
  );
};

export default ResearchReports;
