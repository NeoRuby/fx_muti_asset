
import React, { useState, useMemo, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DurationData } from '../types';

const DurationChart: React.FC = () => {
  const [data, setData] = useState<DurationData[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<{message: string, url: string} | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorInfo(null);
    /**
     * 强制清除缓存：添加时间戳。
     * 由于文件已移动到 public 目录下，它会被部署在网站根路径。
     * 使用绝对路径 /test.txt 能够确保在任何路由下都能正确访问。
     */
    const targetUrl = `/test.txt?t=${new Date().getTime()}`;
    const fullUrl = new URL(targetUrl, window.location.href).href;

    try {
      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`文件不存在 (404)。请确保 test.txt 已放置在项目的 public 文件夹中。`);
        }
        throw new Error(`服务器响应异常: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length <= 1) {
        throw new Error('文件内容为空或格式不正确。');
      }

      const dataLines = lines.slice(1);
      const parsedData = dataLines
        .map((line, index) => {
          const parts = line.split(/\s+/);
          if (parts.length < 2) return null;
          
          const rawDate = parts[0].trim();
          const rawValue = parts[1].trim();
          const value = parseFloat(rawValue);
          
          if (isNaN(value)) return null;

          // 处理 D/M/YYYY 格式
          const dateParts = rawDate.split('/');
          if (dateParts.length === 3) {
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            return { date: `${year}-${month}-${day}`, value };
          }

          if (rawDate.includes('-') && rawDate.split('-').length === 3) {
              return { date: rawDate, value };
          }
          return null;
        })
        .filter((item): item is DurationData => item !== null);

      if (parsedData.length === 0) {
        throw new Error('未能解析到任何有效数据行，请检查数据分隔符是否为空格或Tab。');
      }

      parsedData.sort((a, b) => a.date.localeCompare(b.date));
      setData(parsedData);
      
      if (parsedData.length > 0) {
        setStartDate(parsedData[0].date);
        setEndDate(parsedData[parsedData.length - 1].date);
      }
    } catch (err: any) {
      console.error("Data Load Error:", err);
      setErrorInfo({
        message: err.message || '未知网络错误',
        url: fullUrl
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const isAfterStart = startDate ? item.date >= startDate : true;
      const isBeforeEnd = endDate ? item.date <= endDate : true;
      return isAfterStart && isBeforeEnd;
    });
  }, [data, startDate, endDate]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { max: '0.00', min: '0.00', avg: '0.00' };
    const values = filteredData.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      max: Math.max(...values).toFixed(4),
      min: Math.min(...values).toFixed(4),
      avg: (sum / values.length).toFixed(4)
    };
  }, [filteredData]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 text-slate-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p>正在连接 public 目录下的数据源...</p>
    </div>
  );

  if (errorInfo) return (
    <div className="p-8 bg-white rounded-2xl border border-red-100 shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-4 text-red-600">
        <span className="text-2xl">🚫</span>
        <h3 className="text-lg font-bold">数据加载失败</h3>
      </div>
      <p className="text-slate-600 mb-6 text-sm leading-relaxed">
        系统尝试访问 public 文件夹中的数据，但未能成功：
      </p>
      <div className="bg-slate-900 text-blue-400 p-4 rounded-lg font-mono text-xs break-all mb-6">
        {errorInfo.url}
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
        <p className="text-red-700 text-sm font-medium">错误详情: {errorInfo.message}</p>
      </div>
      <div className="flex space-x-4">
        <button 
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          重试连接
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          刷新页面
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">平均久期</p>
          <p className="text-3xl font-bold text-slate-900">{stats.avg}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">样本最大值</p>
          <p className="text-3xl font-bold text-blue-600">{stats.max}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">样本最小值</p>
          <p className="text-3xl font-bold text-slate-400">{stats.min}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">开始</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <span className="text-slate-300 mt-5">—</span>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">结束</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                dy={12}
                minTickGap={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                dx={-8}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2} 
                fill="url(#colorValue)" 
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
          <span>数据源: public/test.txt</span>
          <span>有效样本数: {filteredData.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DurationChart;
