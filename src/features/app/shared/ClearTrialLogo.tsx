interface ClearTrialLogoProps {
  onClick: () => void;
  variant?: "default" | "stripe";
}

export function ClearTrialLogo({ onClick, variant = "default" }: ClearTrialLogoProps) {
  const isStripe = variant === "stripe";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isStripe
          ? "group inline-flex items-center gap-3 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-white backdrop-blur transition hover:bg-white/15"
          : "group inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-blue-300 hover:bg-blue-50"
      }
      aria-label="Go to ClearTrial home"
      title="Go to home"
    >
      <span className={isStripe ? "grid h-10 w-10 place-items-center rounded-lg bg-white/20 shadow-sm" : "grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm"}>
        <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
          <circle cx="24" cy="24" r="18" className={isStripe ? "fill-white/25" : "fill-white/20"} />
          <path d="M8 24h7l4-8 6 16 5-10h10" className="stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
      <span className="text-left">
        <span className={isStripe ? "block text-sm font-semibold text-white" : "block text-sm font-semibold text-slate-900 group-hover:text-blue-700"}>ClearTrial</span>
        <span className={isStripe ? "block text-[11px] uppercase tracking-wide text-white/85" : "block text-[11px] uppercase tracking-wide text-slate-500"}>Clinical EDC</span>
      </span>
    </button>
  );
}
