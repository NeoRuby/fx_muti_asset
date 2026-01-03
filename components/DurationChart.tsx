
import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DurationData } from '../types';

const DurationChart: React.FC = () => {
  const [data, setData] = useState<DurationData[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorInfo(null);
      try {
        // 获取根目录下的 test.txt
        const response = await fetch('test.txt');
        if (!response.ok) {
          throw new Error(`无法获取文件: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        // 按行分割，并过滤掉完全空白的行
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length <= 1) {
          throw new Error('文件内容不足（可能只有表头或为空）');
        }

        // 第一行是表头，从第二行开始解析数据
        const dataLines = lines.slice(1);
        
        const parsedData = dataLines
          .map((line, index) => {
            // 使用正则表达式匹配一个或多个空白字符（支持 Tab 和空格）
            const parts = line.split(/\s+/);
            
            // 确保每行至少有两列：日期 和 数值
            if (parts.length < 2) {
              console.warn(`第 ${index + 2} 行数据格式不完整: "${line}"`);
              return null;
            }
            
            const rawDate = parts[0].trim();
            const rawValue = parts[1].trim();
            const value = parseFloat(rawValue);
            
            if (isNaN(value)) {
              console.warn(`第 ${index + 2} 行数值解析失败: "${rawValue}"`);
              return null;
            }

            // 处理 D/M/YYYY 格式 (例如 4/1/2022)
            const dateParts = rawDate.split('/');
            if (dateParts.length === 3) {
              const day = dateParts[0].padStart(2, '0');
              const month = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              // 转化为标准 YYYY-MM-DD 格式，便于排序和过滤
              return { date: `${year}-${month}-${day}`, value };
            }

            // 如果日期已经是 YYYY-MM-DD 格式
            if (rawDate.includes('-') && rawDate.split('-').length === 3) {
                return { date: rawDate, value };
            }

            console.warn(`第 ${index + 2} 行日期格式无法识别: "${rawDate}"`);
            return null;
          })
          .filter((item): item is DurationData => item !== null);

        if (parsedData.length === 0) {
          throw new Error('解析后未发现有效数据行');
        }

        // 按日期从旧到新排序
        parsedData.sort((a, b) => a.date.localeCompare(b.date));

        setData(parsedData);
        
        // 自动初始化日期筛选范围
        if (parsedData.length > 0) {
          setStartDate(parsedData[0].date);
          setEndDate(parsedData[parsedData.length - 1].date);
        }
      } catch (err: any) {
        console.error("数据加载错误:", err);
        setErrorInfo(err.message || '未知错误');
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
    <div className="flex flex-col justify-center items-center h-64 text-slate-500 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p className="animate-pulse">正在读取 test.txt 并解析数据指标...</p>
    </div>
  );

  if (errorInfo || data.length === 0) return (
    <div className="p-10 text-center bg-red-50 border border-red-100 rounded-xl">
      <span className="text-4xl mb-4 block">⚠️</span>
      <h3 className="text-lg font-bold text-red-800 mb-2">数据加载失败</h3>
      <p className="text-red-600 mb-4">{errorInfo || '未能从 test.txt 解析到有效数据指标'}</p>
      <div className="text-left bg-white p-4 rounded border border-red-200 text-xs text-slate-500 font-mono overflow-auto max-h-40">
        <p className="font-bold mb-1">预期格式提示：</p>
        <p>第一行为表头，第二行开始为数据。</p>
        <p>示例：4/1/2022 [Tab] 1.7636</p>
        <p className="mt-2 text-red-400">当前错误详情: {errorInfo}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">平均久期 (选定周期)</p>
          <p className="text-3xl font-bold text-slate-900">{stats.avg}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">周期内峰值</p>
          <p className="text-3xl font-bold text-blue-600">{stats.max}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">周期内谷值</p>
          <p className="text-3xl font-bold text-slate-400">{stats.min}</p>
        </div>
      </div>

      {/* 日期筛选控制栏 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <span className="text-slate-300 mt-5">—</span>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-1 text-right">
            <button 
                onClick={() => {
                    setStartDate(data[0].date);
                    setEndDate(data[data.length-1].date);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-4"
            >
                重置时间范围
            </button>
        </div>
      </div>

      {/* 主图表区域 */}
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
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="全市场久期"
                stroke="#2563eb" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={800}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#2563eb' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>DataSource: Root/test.txt</span>
          </div>
          <div className="flex space-x-4">
            <span>Points: {filteredData.length}</span>
            <span className="text-slate-300">|</span>
            <span>Encoding: UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DurationChart;

