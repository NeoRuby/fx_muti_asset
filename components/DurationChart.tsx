import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DurationData } from '../types';

const DurationChart: React.FC = () => {
  const [data, setData] = useState<DurationData[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // 从根目录加载并解析 test.txt
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('test.txt');
        if (!response.ok) {
          throw new Error('无法加载 test.txt 文件，请检查文件是否存在于根目录。');
        }
        const text = await response.text();
        const lines = text.trim().split(/\r?\n/);
        
        // 跳过第一行表头: date :ȫ
        const dataLines = lines.slice(1);
        
        const parsedData = dataLines
          .map(line => {
            // 文件使用制表符 (Tab) 分隔
            const parts = line.split(/\t/);
            if (parts.length < 2) return null;
            
            const rawDate = parts[0].trim();
            const value = parseFloat(parts[1].trim());
            
            if (isNaN(value)) return null;

            /**
             * 转换日期格式 D/M/YYYY 为 YYYY-MM-DD
             * 这样字符串比较 (item.date >= startDate) 才能正确工作，
             * 且图表 X 轴排序更准确。
             */
            const dateParts = rawDate.split('/');
            if (dateParts.length === 3) {
              const day = dateParts[0].padStart(2, '0');
              const month = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              // 假设 D/M/YYYY 顺序
              return { date: `${year}-${month}-${day}`, value };
            }
            return null;
          })
          .filter((item): item is DurationData => item !== null);

        // 按日期升序排列
        parsedData.sort((a, b) => a.date.localeCompare(b.date));

        setData(parsedData);
        
        if (parsedData.length > 0) {
          setStartDate(parsedData[0].date);
          setEndDate(parsedData[parsedData.length - 1].date);
        }
      } catch (err) {
        console.error("加载数据失败:", err);
      } finally {
        setLoading(false);
      }
    };
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
    if (filteredData.length === 0) return { max: 0, min: 0, avg: 0 };
    const values = filteredData.map(d => d.value);
    return {
      max: Math.max(...values).toFixed(4),
      min: Math.min(...values).toFixed(4),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(4)
    };
  }, [filteredData]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">正在分析 test.txt 数据源...</div>;
  if (data.length === 0) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">未能从 test.txt 解析到有效数据，请检查文件格式。</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">开始日期</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">结束日期</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex-1 flex justify-end gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">平均久期</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{stats.avg}</p>
          </div>
          <div className="text-right border-l pl-6 border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">峰值</p>
            <p className="text-2xl font-bold text-blue-600 leading-none">{stats.max}</p>
          </div>
          <div className="text-right border-l pl-6 border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">谷值</p>
            <p className="text-2xl font-bold text-slate-500 leading-none">{stats.min}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fill: '#94a3b8'}}
                dy={12}
                minTickGap={40}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fill: '#94a3b8'}}
                dx={-8}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="久期数值"
                stroke="#2563eb" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1000}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>数据源: 根目录/test.txt (自动解析)</span>
          </div>
          <div className="italic">
            样本总量: {filteredData.length} 个数据点
          </div>
        </div>
      </div>
    </div>
  );
};

export default DurationChart;
