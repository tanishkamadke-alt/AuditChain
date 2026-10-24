import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  ShieldAlert,
  KeyRound,
  Network,
  FileText,
  Table2,
  BookOpen,
  Settings,
  Shield,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Audit Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Audit Workspace",
    path: "/workspace",
    icon: ClipboardCheck,
  },
  {
    label: "Security Findings",
    path: "/findings",
    icon: ShieldAlert,
  },
  {
    label: "Privileged Functions",
    path: "/privileged",
    icon: KeyRound,
  },
  {
    label: "Architecture Review",
    path: "/architecture",
    icon: Network,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    label: "Findings Spreadsheet",
    path: "/spreadsheet",
    icon: Table2,
  },
  {
    label: "Methodology",
    path: "/methodology",
    icon: BookOpen,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside
      className="
        fixed left-0 top-0 z-40
        flex h-screen w-64 flex-col
        border-r border-slate-800
        bg-slate-950
      "
    >

      {/* BRAND */}
      <div className="flex h-16 items-center border-b border-slate-800 px-5">

        <div
          className="
            flex h-8 w-8 items-center justify-center
            rounded-lg border border-cyan-500/30
            bg-cyan-500/10
            text-cyan-400
          "
        >
          <Shield className="h-4 w-4" />
        </div>

        <div className="ml-3">
          <p className="text-sm font-bold text-white">
            AuditChain
          </p>

          <p className="text-[9px] text-cyan-400">
            Smart Contract Security
          </p>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Workspace
        </p>

        <div className="space-y-1">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => `
                  group relative flex items-center gap-3
                  rounded-lg px-3 py-2.5
                  text-xs font-medium
                  transition-all duration-200

                  ${
                    isActive
                      ? `
                        border border-cyan-500/20
                        bg-cyan-500/10
                        text-cyan-400
                        shadow-sm shadow-cyan-950/20
                      `
                      : `
                        border border-transparent
                        text-slate-400
                        hover:border-slate-800
                        hover:bg-slate-900
                        hover:text-cyan-400
                      `
                  }
                `}
              >

                {/* ACTIVE INDICATOR */}
                <span
                  className="
                    absolute left-0 top-1/2
                    h-5 w-0.5
                    -translate-y-1/2
                    rounded-full
                    bg-cyan-400
                    opacity-0
                    transition-opacity duration-200
                    group-[.active]:opacity-100
                  "
                />

                <Icon
                  className="
                    h-4 w-4 shrink-0
                    transition-all duration-200
                    group-hover:scale-110
                  "
                />

                <span>
                  {item.label}
                </span>

              </NavLink>
            );
          })}

        </div>

      </nav>


      {/* FOOTER */}
      <div className="border-t border-slate-800 p-3">

        <div
          className="
            rounded-lg border border-slate-800
            bg-slate-900/60 px-3 py-3
            transition-all duration-200
            hover:border-cyan-500/20
            hover:bg-slate-900
          "
        >

          <p className="text-[10px] font-semibold text-white">
            EtherAuthority Internship
          </p>

          <div className="mt-1 flex items-center gap-1.5">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[9px] text-slate-500">
              Arbitrum
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}