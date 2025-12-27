
import React, { useState, useRef, useEffect } from 'react';
import { LawSystem, AppTheme } from './types';
import { analyzeLegalCase, AnalysisResult } from './services/geminiService';

const Header: React.FC<{ 
  onLogout: () => void; 
  theme: AppTheme; 
  setTheme: (t: AppTheme) => void 
}> = ({ onLogout, theme, setTheme }) => {
  return (
    <header className={`flex justify-between items-center p-6 w-full max-w-7xl mx-auto border-b transition-all duration-500 no-print ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          خروج
        </button>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light-green' : 'dark')}
          className={`p-2 rounded-lg border transition-all ${theme === 'dark' ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-green-600/30 text-green-700 hover:bg-green-50'}`}
        >
          {theme === 'dark' ? 'الوضع الرسمي' : 'الوضع الذهبي'}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <h2 className={`text-xl font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>واعد <span className="text-amber-500">IA</span></h2>
          <p className="text-[10px] opacity-50 font-bold uppercase mt-1">المستشار الذكي</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl ${
          theme === 'dark' ? 'bg-slate-900 border-amber-500/40' : 'bg-green-700 border-green-800'
        }`}>
          <span className={`text-xl font-black ${theme === 'dark' ? 'text-amber-500' : 'text-white'}`}>IA</span>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lawSystem, setLawSystem] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('waed_auth');
    if (session === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const u = username.trim().toUpperCase();
    const p = password.trim().toUpperCase().replace(/\s/g, ''); // إزالة المسافات من كلمة المرور لتسهيل الدخول

    // التحقق من ADMIN و ADMIN 6787
    if (
      (u === 'ADMIN1' && p === 'ADMIN1') || 
      (u === 'ADMIN' && p === 'ADMIN6787')
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('waed_auth', 'true');
    } else {
      setLoginError('بيانات الدخول غير صحيحة. تأكد من الحروف والمسافات.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawSystem || !details.trim()) return;
    setResult(null);
    setIsLoading(true);
    try {
      const res = await analyzeLegalCase(lawSystem, details);
      setResult(res);
    } catch (err) {
      setResult({ text: "حدث خطأ أثناء التحليل. يرجى التحقق من اتصال الإنترنت أو صلاحية مفتاح الـ API.", sources: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const themeStyle = theme === 'dark' 
    ? { bg: 'bg-[#0a0f1e]', card: 'bg-slate-900/50 border-white/5 backdrop-blur-xl', accent: 'text-amber-500', btn: 'bg-amber-600 hover:bg-amber-500 text-black shadow-amber-500/20' }
    : { bg: 'bg-slate-50', card: 'bg-white border-slate-200 shadow-xl', accent: 'text-green-700', btn: 'bg-green-700 hover:bg-green-800 text-white shadow-green-700/20' };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${themeStyle.bg}`}>
        <div className={`w-full max-w-md p-10 rounded-[2.5rem] border shadow-2xl transition-all ${themeStyle.card}`}>
          <div className="text-center mb-10">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 border-2 ${theme === 'dark' ? 'border-amber-500/40 bg-amber-500/5' : 'border-green-600/20 bg-green-50'}`}>
              <span className={`text-4xl font-black ${themeStyle.accent}`}>IA</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">منصة واعد القانونية</h1>
            <p className="text-xs opacity-50 mt-2 font-bold">نظام التحليل بالذكاء الاصطناعي</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={`w-full px-6 py-4 rounded-xl border focus:outline-none font-bold transition-all ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600'}`}
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-6 py-4 rounded-xl border focus:outline-none font-bold transition-all ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600'}`}
            />
            {loginError && <p className="text-red-500 text-[10px] font-bold text-center px-2">{loginError}</p>}
            <button type="submit" className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 shadow-lg ${themeStyle.btn}`}>
              دخول النظام
            </button>
          </form>
          <div className="mt-8 text-center opacity-30 text-[10px] font-bold">
            نظام آمن للمستشارين المعتمدين فقط
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${themeStyle.bg} text-inherit`}>
      <Header 
        onLogout={() => { sessionStorage.clear(); setIsAuthenticated(false); }} 
        theme={theme} 
        setTheme={setTheme} 
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12 no-print">
          <h1 className={`text-5xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            تحليل <span className={themeStyle.accent}>القضايا</span> الذكي
          </h1>
          <p className="opacity-50 font-bold">أدخل تفاصيل الحالة للحصول على تحليل قانوني مبدئي</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 rounded-[2rem] border shadow-2xl no-print ${themeStyle.card}`}>
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest opacity-40 mb-3 mr-2">النظام القضائي</label>
              <select
                value={lawSystem}
                onChange={e => setLawSystem(e.target.value)}
                className={`w-full p-4 rounded-xl border font-bold text-lg focus:outline-none appearance-none cursor-pointer ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="">اختر النظام...</option>
                {Object.values(LawSystem).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest opacity-40 mb-3 mr-2">وقائع الحالة</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={5}
                placeholder="اكتب تفاصيل الحالة القانونية هنا..."
                className={`w-full p-6 rounded-2xl border font-medium text-lg leading-relaxed focus:outline-none resize-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-green-600'}`}
              />
            </div>

            <button
              disabled={isLoading || !lawSystem || !details}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 disabled:opacity-20 ${themeStyle.btn}`}
            >
              {isLoading ? 'جاري التحليل الرقمي...' : 'توليد التحليل القانوني'}
            </button>
          </div>
        </form>

        {result && (
          <div ref={resultRef} className="mt-12 animate-fade-in">
            <div className={`p-10 rounded-[2.5rem] border shadow-2xl ${themeStyle.card}`}>
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <h3 className="text-2xl font-black">نتائج الدراسة القانونية</h3>
                <button onClick={() => window.print()} className="text-xs font-bold underline opacity-50 no-print hover:opacity-100">طباعة التقرير</button>
              </div>
              <div className={`text-xl leading-[2] whitespace-pre-wrap font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {result.text}
              </div>
              
              {result.sources.length > 0 && (
                <div className="mt-10 pt-8 border-t border-white/5 no-print">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${themeStyle.accent}`}>المراجع والروابط:</p>
                  <div className="flex flex-wrap gap-3">
                    {result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold hover:border-amber-500/50 transition-all">{s.title}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 text-center no-print">
        <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.4em]">منصة واعد IA - الإصدار الاحترافي 2025</p>
      </footer>
    </div>
  );
}
