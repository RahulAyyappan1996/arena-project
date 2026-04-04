import { SlidersHorizontal, Moon, Sun, Clock3 } from "lucide-react";
import { ThemeSettings } from "../types";

interface ThemeSchedulerProps {
  open: boolean;
  settings: ThemeSettings;
  isDarkMode: boolean;
  onTogglePanel: () => void;
  onSettingsChange: (value: ThemeSettings | ((prev: ThemeSettings) => ThemeSettings)) => void;
  showTrigger?: boolean;
}

export function ThemeScheduler({
  open,
  settings,
  isDarkMode,
  onTogglePanel,
  onSettingsChange,
  showTrigger = true,
}: ThemeSchedulerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {showTrigger && (
        <button
          onClick={onTogglePanel}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={16} />
          Theme
          <span className={`rounded-full px-2 py-0.5 text-xs ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {isDarkMode ? "Dark" : "Light"}
          </span>
        </button>
      )}

      {open && (
        <div className="w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Theme Scheduler</p>
            <button
              onClick={() =>
                onSettingsChange((prev) => ({
                  ...prev,
                  mode: "manual",
                  manualDark: !isDarkMode,
                }))
              }
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
              Toggle Now
            </button>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</label>
          <select
            value={settings.mode}
            onChange={(e) => onSettingsChange((prev) => ({ ...prev, mode: e.target.value as ThemeSettings["mode"] }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="manual">Manual (On/Off)</option>
            <option value="custom-time">Custom Time Window</option>
            <option value="sun-cycle">Sunrise / Sunset</option>
          </select>

          {settings.mode === "manual" && (
            <button
              onClick={() => onSettingsChange((prev) => ({ ...prev, manualDark: !prev.manualDark }))}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${settings.manualDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}
            >
              {settings.manualDark ? <Moon size={16} /> : <Sun size={16} />}
              Dark Mode {settings.manualDark ? "On" : "Off"}
            </button>
          )}

          {settings.mode === "custom-time" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">Start</span>
                <input
                  type="time"
                  value={settings.customStart}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, customStart: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">End</span>
                <input
                  type="time"
                  value={settings.customEnd}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, customEnd: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
            </div>
          )}

          {settings.mode === "sun-cycle" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">Sunrise</span>
                <input
                  type="time"
                  value={settings.sunrise}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, sunrise: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">Sunset</span>
                <input
                  type="time"
                  value={settings.sunset}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, sunset: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
            </div>
          )}

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <p className="font-semibold">Current Status</p>
            <p className="mt-1 inline-flex items-center gap-1">
              <Clock3 size={12} />
              {settings.mode === "manual"
                ? `Manual mode: ${settings.manualDark ? "Dark" : "Light"}`
                : settings.mode === "custom-time"
                  ? `Dark window: ${settings.customStart} - ${settings.customEnd}`
                  : `Sun cycle: dark from ${settings.sunset} to ${settings.sunrise}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
