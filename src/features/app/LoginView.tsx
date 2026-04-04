import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { EnvironmentType } from "./types";

interface LoginViewProps {
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
  onSignIn: (email: string) => void;
}

export function LoginView({
  environment,
  setEnvironment,
  isDarkMode,
  onToggleDark,
  onSignIn,
}: LoginViewProps) {
  const [email, setEmail] = useState("user@cleartrial.com");
  const [username, setUsername] = useState("cleartrial.user");
  const [password, setPassword] = useState("password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gateway</p>
          <button
            onClick={onToggleDark}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
        <h2 className="mt-1 text-3xl font-semibold">ClearTrial Login</h2>
        <p className="mt-2 text-slate-600">Sign in to access the study lifecycle workspace.</p>

        <div className="mt-6 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Email" />
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Username" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Password" type="password" />
          <div>
            <label className="mb-1 block text-sm font-medium">Environment Type</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="uat">UAT Database</option>
              <option value="production">Production Database</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onSignIn(email)}
          className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 active:scale-[0.99]"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
