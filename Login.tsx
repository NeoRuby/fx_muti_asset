
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟后端逻辑
    if (username === 'admin' && password === '1234') {
      onLogin(username);
    } else {
      setError('用户名或密码错误，请联系系统管理员。');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">ZT</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">中泰证券固收多资产</h2>
          <p className="mt-2 text-slate-400">专业投资分析决策支持系统</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">用户名</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入分析师账号"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">密码</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              登 录
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              内部系统，仅供授权人员访问。由固定收益多资产研究组提供数据支持。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
