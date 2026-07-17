import React, { useState } from "react";
import { 
  auth 
} from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  Cpu, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  LockKeyhole
} from "lucide-react";

interface AuthViewProps {
  onSuccess: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccess("Authentication success! Connecting to operational hub...");
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        // Sign up
        if (!name.trim()) {
          throw new Error("Please specify your commander name.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
        setSuccess("Account successfully created! Redirecting to operational hub...");
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Auth action failed:", err);
      let errorMsg = "An unexpected error occurred during authorization.";
      if (err.code === "auth/operation-not-allowed") {
        errorMsg = "EMAIL_NOT_ENABLED";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errorMsg = "Invalid email or credentials. Please double check.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered in our directory.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Password strength is too low. Must be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Please enter a valid email address.";
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isEmailNotEnabledError = error === "EMAIL_NOT_ENABLED";

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden select-none font-sans">
      {/* Background cyber accent elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10 animate-fadeIn">
        {/* Decorative corner highlights */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />

        {/* Branding header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/15 border border-blue-500/30 rounded-xl text-blue-500 shadow-inner">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-widest text-slate-100 uppercase">
              7HIVE Media+
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">
              OPERATIONS HUB SECURE CONTROL v4.2
            </p>
          </div>
        </div>

        {/* Tabs to switch */}
        <div className="grid grid-cols-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLogin 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            COMMANDER LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isLogin 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            REGISTER NEW CORE
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl flex flex-col space-y-2 text-xs animate-shake">
            <div className="flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <span className="leading-normal font-bold">
                {isEmailNotEnabledError ? "Uplink Configuration Required" : "Authorization Failure"}
              </span>
            </div>
            {isEmailNotEnabledError ? (
              <div className="pl-6 text-slate-300 space-y-2 font-mono text-[10px] leading-relaxed">
                <p>Email/Password authentication provider is not enabled on this Firebase Project.</p>
                <p className="font-sans text-xs font-semibold text-blue-400">
                  Please enable it using the steps below:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Open the{" "}
                    <a 
                      href="https://console.firebase.google.com/project/gen-lang-client-0633487323/authentication/providers" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Firebase Console
                    </a>
                  </li>
                  <li>Click <span className="text-white font-semibold">"Add new provider"</span></li>
                  <li>Select <span className="text-white font-semibold">"Email/Password"</span>, toggle <span className="text-white font-semibold">"Enable"</span>, and click <span className="text-white font-semibold">"Save"</span></li>
                  <li>Return to this tab and engage access handshake again!</li>
                </ol>
              </div>
            ) : (
              <span className="pl-6 leading-normal">{error}</span>
            )}
          </div>
        )}

        {success && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <span className="leading-normal">{success}</span>
          </div>
        )}

        {/* Authorization Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Commander name for signup */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Commander Display Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Aiden Cross"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-slate-950/80 transition"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Dossier Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="commander@7hive.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-slate-950/80 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Security Passphrase *
              </label>
              {isLogin && (
                <span className="text-[10px] text-blue-500 hover:underline cursor-pointer font-semibold">
                  Forgotten Key?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-slate-950/80 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submission button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 mt-2 cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-blue-950/50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Establishing uplink...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "ENGAGE ACCESS HANDSHAKE" : "DISPATCH REGISTRATION CORE"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-[10px] text-slate-500 font-mono flex items-center justify-center space-x-1.5">
          <LockKeyhole className="w-3.5 h-3.5 text-slate-600" />
          <span>Failsafe encryption link activated securely.</span>
        </div>
      </div>
    </div>
  );
}
