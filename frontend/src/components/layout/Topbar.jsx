import { Bell, Settings } from "lucide-react";

export default function Topbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 backdrop-blur">
      
      <div>
        <h2 className="text-lg font-semibold text-white">
          Dashboard
        </h2>
        <p className="text-xs text-slate-500">
          Audit Console
        </p>
      </div>

      <div className="flex items-center gap-5">
        
        {/* Network */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-slate-300">
            Arbitrum
          </span>
        </div>

        <button className="text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </button>

        <button className="text-slate-400 hover:text-white">
          <Settings className="h-5 w-5" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
            TM
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Tanishka Madke
            </p>

          </div>
        </div>

      </div>
    </header>
  );
}