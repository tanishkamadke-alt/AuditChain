import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { projects } from "../data/projects";

const statusStyles = {
  "In Progress":
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",

  Pending:
    "border-slate-700 bg-slate-900 text-slate-400",

  Completed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

function SeverityBar({ project }) {
  const { critical, high, medium, low, informational } =
    project.findings;

  const total =
    critical + high + medium + low + informational;

  if (total === 0) {
    return (
      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-slate-800 transition-colors group-hover:bg-slate-700" />

        <p className="mt-2 text-xs text-slate-600">
          No findings recorded
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        {critical > 0 && (
          <div
            className="h-full bg-red-500"
            style={{ width: `${(critical / total) * 100}%` }}
          />
        )}

        {high > 0 && (
          <div
            className="h-full bg-orange-500"
            style={{ width: `${(high / total) * 100}%` }}
          />
        )}

        {medium > 0 && (
          <div
            className="h-full bg-yellow-500"
            style={{ width: `${(medium / total) * 100}%` }}
          />
        )}

        {low > 0 && (
          <div
            className="h-full bg-blue-400"
            style={{ width: `${(low / total) * 100}%` }}
          />
        )}

        {informational > 0 && (
          <div
            className="h-full bg-slate-400"
            style={{
              width: `${(informational / total) * 100}%`,
            }}
          />
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
        {critical > 0 && <span>Critical {critical}</span>}
        {high > 0 && <span>High {high}</span>}
        {medium > 0 && <span>Medium {medium}</span>}
        {low > 0 && <span>Low {low}</span>}
        {informational > 0 && (
          <span>Info {informational}</span>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, copiedId, onCopy }) {
  const navigate = useNavigate();

  const styles = statusStyles[project.status];

  const findingCount =
    project.findings.critical +
    project.findings.high +
    project.findings.medium +
    project.findings.low +
    project.findings.informational;

  return (
    <div
      className="
        group rounded-xl border border-slate-800 bg-slate-900/60 p-5
        transition-all duration-200 ease-out
        hover:-translate-y-1
        hover:border-cyan-500/30
        hover:bg-slate-900
        hover:shadow-lg hover:shadow-cyan-950/20
      "
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600 transition-colors group-hover:text-slate-500">
            Project {project.id}
          </p>

          <h3 className="mt-1 font-semibold text-white transition-colors group-hover:text-cyan-400">
            {project.token}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {project.project.replace(`Project ${project.id} — `, "")}
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${styles}`}
        >
          {project.status}
        </span>
      </div>

      {/* Contract Address */}
      <div
        className="
          mt-5 rounded-lg border border-slate-800
          bg-slate-950/60 p-3
          transition-all duration-200
          group-hover:border-slate-700
          group-hover:bg-slate-950
        "
      >
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          Contract Address
        </p>

        <div className="mt-1 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate text-[11px] text-slate-400 transition-colors group-hover:text-slate-300">
            {project.contractAddress}
          </code>

          <button
            onClick={() =>
              onCopy(project.contractAddress, project.id)
            }
            title="Copy contract address"
            className="
              shrink-0 rounded-md border border-slate-800
              bg-slate-900 p-1.5
              text-slate-500
              transition-all duration-200
              hover:border-cyan-500/30
              hover:bg-cyan-500/10
              hover:text-cyan-400
              active:scale-95
            "
          >
            {copiedId === project.id ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-transparent p-2 transition-all hover:border-slate-800 hover:bg-slate-950">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Network
          </p>

          <p className="mt-1 text-xs text-slate-300">
            {project.network}
          </p>
        </div>

        <div className="rounded-lg border border-transparent p-2 transition-all hover:border-slate-800 hover:bg-slate-950">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Findings
          </p>

          <p className="mt-1 text-xs font-semibold text-white">
            {findingCount}
          </p>
        </div>
      </div>

      {/* Finding distribution */}
      <SeverityBar project={project} />

      {/* Action */}
      <button
        onClick={() => navigate(`/workspace/${project.id}`)}
        className="
          mt-5 flex w-full items-center justify-center gap-2
          rounded-lg border border-slate-700
          bg-slate-800/50 px-4 py-2.5
          text-xs font-medium text-slate-300
          transition-all duration-200
          hover:border-cyan-500/40
          hover:bg-cyan-500/10
          hover:text-cyan-400
          active:scale-[0.98]
        "
      >
        Open Audit

        <ExternalLink
          className="
            h-3.5 w-3.5
            transition-transform duration-200
            group-hover:translate-x-0.5
          "
        />
      </button>
    </div>
  );
}

export default function AuditProjects() {
  const [copiedId, setCopiedId] = useState(null);

  const copyAddress = async (address, id) => {
    try {
      await navigator.clipboard.writeText(address);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Audit Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Audit Projects
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage assigned smart contract audits across the
            Arbitrum ecosystem.
          </p>
        </div>

        <div
          className="
            rounded-lg border border-slate-800 bg-slate-900 px-4 py-2
            transition-all duration-200
            hover:border-cyan-500/30
            hover:bg-slate-800
          "
        >
          <p className="text-xs text-slate-500">
            Total assignments
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {projects.length}
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <div className="group relative flex-1">
          <Search
            className="
              absolute left-3 top-1/2 h-4 w-4
              -translate-y-1/2 text-slate-600
              transition-colors
              group-focus-within:text-cyan-400
            "
          />

          <input
            type="text"
            placeholder="Search projects, tokens or contract addresses..."
            className="
              w-full rounded-lg border border-slate-800
              bg-slate-900 py-3 pl-10 pr-4
              text-sm text-white outline-none
              placeholder:text-slate-600
              transition-all duration-200
              hover:border-slate-700
              focus:border-cyan-500/50
              focus:bg-slate-900
              focus:ring-1 focus:ring-cyan-500/20
            "
          />
        </div>

        <button
          className="
            flex items-center justify-center gap-2
            rounded-lg border border-slate-800
            bg-slate-900 px-5 py-3
            text-sm text-slate-400
            transition-all duration-200
            hover:border-cyan-500/30
            hover:bg-slate-800
            hover:text-cyan-400
            active:scale-[0.98]
          "
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Quick status summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div
          className="
            group flex cursor-default items-center gap-3
            rounded-lg border border-cyan-500/10
            bg-cyan-500/5 px-4 py-3
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-cyan-500/30
            hover:bg-cyan-500/10
          "
        >
          <Clock3 className="h-5 w-5 text-cyan-400 transition-transform group-hover:scale-110" />

          <div>
            <p className="text-xs text-slate-500">
              In Progress
            </p>

            <p className="text-sm font-semibold text-white">
              {
                projects.filter(
                  (p) => p.status === "In Progress"
                ).length
              }
            </p>
          </div>
        </div>

        <div
          className="
            group flex cursor-default items-center gap-3
            rounded-lg border border-emerald-500/10
            bg-emerald-500/5 px-4 py-3
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-emerald-500/30
            hover:bg-emerald-500/10
          "
        >
          <ShieldCheck className="h-5 w-5 text-emerald-400 transition-transform group-hover:scale-110" />

          <div>
            <p className="text-xs text-slate-500">
              Completed
            </p>

            <p className="text-sm font-semibold text-white">
              {
                projects.filter(
                  (p) => p.status === "Completed"
                ).length
              }
            </p>
          </div>
        </div>

        <div
          className="
            group flex cursor-default items-center gap-3
            rounded-lg border border-amber-500/10
            bg-amber-500/5 px-4 py-3
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-amber-500/30
            hover:bg-amber-500/10
          "
        >
          <AlertTriangle className="h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />

          <div>
            <p className="text-xs text-slate-500">
              Pending
            </p>

            <p className="text-sm font-semibold text-white">
              {
                projects.filter(
                  (p) => p.status === "Pending"
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Project grid */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            copiedId={copiedId}
            onCopy={copyAddress}
          />
        ))}
      </div>
    </div>
  );
}