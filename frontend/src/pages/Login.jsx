import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { sendOtp } from "../api";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const { login, loginWithOtp } = useAuth();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP States
  const [authMode, setAuthMode] = useState("otp"); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState(1); // 1 = enter mobile, 2 = enter otp
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(loc.search);
    if (q.get("demo") === "1") {
      setIdentity("admin");
      setPassword("pass");
    }
  }, [loc.search]);

  async function onLogin(e) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = await login(identity.trim(), password);
      if (activeUser?.role === "admin") {
        nav("/admin");
      } else if (activeUser?.role === "operator") {
        nav("/operator");
      } else {
        nav("/dashboard");
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function onSendOtp(e) {
    if (e) e.preventDefault();
    if (!mobileNumber.trim()) return;
    setError("");
    setLoading(true);

    try {
      await sendOtp(mobileNumber.trim());
      setOtpStep(2);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e) {
    if (e) e.preventDefault();
    if (!otpCode.trim()) return;
    setError("");
    setLoading(true);

    try {
      const activeUser = await loginWithOtp(mobileNumber.trim(), otpCode.trim());
      if (activeUser?.role === "admin") {
        nav("/admin");
      } else if (activeUser?.role === "operator") {
        nav("/operator");
      } else {
        nav("/dashboard");
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmitPassword = identity.trim() && password;
  const canSubmitMobile = mobileNumber.trim().length >= 10;
  const canSubmitOtp = otpCode.trim().length >= 4;

  function loadDemo(i, p) {
    setIdentity(i);
    setPassword(p);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0d14] font-sans transition-colors duration-300">
      <GovHeader
        lastSyncText={t("auth.systemLogin")}
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          <div className="bg-white dark:bg-[#0f141e] rounded-xl border-t-4 border-t-[#0a3161] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8 sm:p-10 transition-colors">
            <div className="flex flex-col items-center mb-8">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Government Crest" 
                className={`h-14 mb-4 transition-all duration-300 ${theme === 'dark' ? 'filter brightness-0 invert opacity-40' : 'opacity-60'}`}
              />
              <h2 className="text-[20px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white leading-tight">
                {t("auth.welcomeBack")}
              </h2>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => { setAuthMode("otp"); setError(""); }}
                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-sm ${authMode === "otp" ? "bg-white dark:bg-[#0f141e] text-[#0a3161] dark:text-cyan-400 shadow" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                OTP Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("password"); setError(""); }}
                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-sm ${authMode === "password" ? "bg-white dark:bg-[#0f141e] text-[#0a3161] dark:text-cyan-400 shadow" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Password
              </button>
            </div>

            {authMode === "password" && (
              <form onSubmit={onLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2">
                    {t("auth.emailOrMobile")}
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-white focus:outline-none focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] dark:focus:border-cyan-500 dark:focus:ring-cyan-500 transition-all text-sm font-bold placeholder:font-normal placeholder:opacity-70 uppercase tracking-widest shadow-inner shadow-slate-100 dark:shadow-none"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="Email or Mobile"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2 mt-4">
                    {t("auth.password")}
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-white focus:outline-none focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] dark:focus:border-cyan-500 dark:focus:ring-cyan-500 transition-all text-sm font-mono tracking-[0.2em] placeholder:tracking-normal placeholder:font-sans shadow-inner shadow-slate-100 dark:shadow-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-widest text-center bg-rose-50 dark:bg-rose-900/10 py-3 border border-rose-200 dark:border-rose-900 uppercase">
                    {error}
                  </div>
                )}

                <button 
                  className="w-full bg-[#0a3161] hover:bg-[#11468F] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold py-4 rounded-md transition-colors mt-4 text-[13px] uppercase tracking-[0.15em] shadow-lg shadow-blue-900/20 dark:shadow-cyan-900/30 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2" 
                  type="submit" 
                  disabled={!canSubmitPassword || loading}
                >
                  {loading ? t("auth.authenticating") : (
                    <>
                      <span>{t("auth.signIn")}</span>
                      <i className="fa-solid fa-arrow-right text-blue-300 dark:text-white group-hover:translate-x-1 transition-transform mb-[1px]"></i>
                    </>
                  )}
                </button>
              </form>
            )}

            {authMode === "otp" && (
              <div className="space-y-5">
                {otpStep === 1 ? (
                  <form onSubmit={onSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2">
                        Mobile Number
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-white focus:outline-none focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] dark:focus:border-cyan-500 dark:focus:ring-cyan-500 transition-all text-sm font-bold tracking-widest shadow-inner shadow-slate-100 dark:shadow-none"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="10-digit mobile number"
                        type="tel"
                        autoComplete="tel"
                      />
                    </div>
                    {error && (
                      <div className="text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-widest text-center bg-rose-50 dark:bg-rose-900/10 py-3 border border-rose-200 dark:border-rose-900 uppercase">
                        {error}
                      </div>
                    )}
                    <button 
                      className="w-full bg-[#0a3161] hover:bg-[#11468F] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold py-4 rounded-md transition-colors mt-4 text-[13px] uppercase tracking-[0.15em] shadow-lg shadow-blue-900/20 dark:shadow-cyan-900/30 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed" 
                      type="submit" 
                      disabled={!canSubmitMobile || loading}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={onVerifyOtp} className="space-y-5">
                    <div className="text-center mb-4">
                      <div className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                        OTP sent to +91 {mobileNumber}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setOtpStep(1); setError(""); }}
                        className="text-[10px] font-black uppercase text-[#0a3161] dark:text-cyan-400 hover:underline mt-1"
                      >
                        Change Number
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2">
                        Enter OTP (Demo: 123456)
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-white focus:outline-none focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] dark:focus:border-cyan-500 dark:focus:ring-cyan-500 transition-all text-center text-xl font-mono tracking-[0.5em] shadow-inner shadow-slate-100 dark:shadow-none"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="••••••"
                        type="text"
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                    </div>
                    {error && (
                      <div className="text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-widest text-center bg-rose-50 dark:bg-rose-900/10 py-3 border border-rose-200 dark:border-rose-900 uppercase">
                        {error}
                      </div>
                    )}
                    <button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-md transition-colors mt-4 text-[13px] uppercase tracking-[0.15em] shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2" 
                      type="submit" 
                      disabled={!canSubmitOtp || loading}
                    >
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">
                {t("auth.demoAccounts")}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setAuthMode("password"); loadDemo("admin", "pass"); }} type="button" className="text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700">admin</button>
                <button onClick={() => { setAuthMode("password"); loadDemo("bus101", "pass"); }} type="button" className="text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700">bus101</button>
                <button onClick={() => { setAuthMode("password"); loadDemo("passenger", "pass"); }} type="button" className="text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700">passenger</button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <div className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {t("welcome.headerTitle")}
      </div>
    </div>
  );
}
