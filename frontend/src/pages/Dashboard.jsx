import { useState } from "react";
import {
  FolderKanban,
  CheckCircle2,
  RefreshCw,
  Clock3,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";

import { projects } from "../data/projects";

const statusStyles = {
  "In Progress":
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",

  Pending:
    "border-slate-700 bg-slate-900 text-slate-400",

  Completed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

function StatCard({ title, value, icon: Icon, iconColor }) {
  return (
    <div
      className="
        group rounded-xl border border-slate-800
        bg-slate-900/60 p-5
        transition-all duration-200
        hover:-translate-y-1
        hover:border-slate-700
        hover:bg-slate-900
        hover:shadow-lg
        hover:shadow-slate-950/40
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white transition-colors group-hover:text-cyan-400">
            {value}
          </p>
        </div>

        <div
          className={`
            rounded-lg bg-slate-800 p-2.5
            transition-all duration-200
            group-hover:scale-110
            group-hover:bg-slate-700
            ${iconColor}
          `}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [copiedId, setCopiedId] = useState(null);

  const totalProjects = projects.length;

  const completedAudits = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const inProgress = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const pending = projects.filter(
    (project) => project.status === "Pending"
  ).length;

  const totalFindings = projects.reduce(
    (total, project) =>
      total +
      project.findings.critical +
      project.findings.high +
      project.findings.medium +
      project.findings.low +
      project.findings.informational,
    0
  );

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

      {/* ==================== HEADER ==================== */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white transition-colors hover:text-cyan-400">
          Smart Contract Security Audit Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Arbitrum Ecosystem – Internship Audit Workspace
        </p>
      </div>

      {/* ==================== NOTICE ==================== */}
      <div
        className="
          mt-6 rounded-xl
          border border-amber-500/20
          bg-amber-500/5
          px-5 py-4
          transition-all duration-200
          hover:border-amber-500/40
          hover:bg-amber-500/10
        "
      >
        <p className="text-sm font-medium text-amber-400">
          AuditChain Audit Workspace
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Manage smart contract audits, security findings,
          privileged functions, architecture reviews and
          professional reports.
        </p>
      </div>

      {/* ==================== STATISTICS ==================== */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
          iconColor="text-cyan-400"
        />

        <StatCard
          title="Completed Audits"
          value={completedAudits}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon={RefreshCw}
          iconColor="text-cyan-400"
        />

        <StatCard
          title="Pending"
          value={pending}
          icon={Clock3}
          iconColor="text-amber-400"
        />

        <StatCard
          title="Total Findings"
          value={totalFindings}
          icon={ShieldAlert}
          iconColor="text-orange-400"
        />

      </div>

      {/* ==================== AUDIT PROGRESS ==================== */}
      <div
        className="
          group mt-6 rounded-xl
          border border-slate-800
          bg-slate-900/60
          p-6
          transition-all duration-200
          hover:border-slate-700
          hover:bg-slate-900
        "
      >
        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-white transition-colors group-hover:text-cyan-400">
              Audit Progress
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Overall internship project completion
            </p>
          </div>

          <span className="text-sm font-medium text-slate-300">
            {completedAudits} / {totalProjects} Projects Completed
          </span>

        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

          <div
            className="
              h-full rounded-full
              bg-cyan-500
              transition-all duration-500
              group-hover:bg-cyan-400
            "
            style={{
              width: `${(completedAudits / totalProjects) * 100}%`,
            }}
          />

        </div>
      </div>

      {/* ==================== ASSIGNED PROJECTS ==================== */}
      <div
        className="
          mt-6 overflow-hidden rounded-xl
          border border-slate-800
          bg-slate-900/60
          transition-all duration-200
          hover:border-slate-700
          hover:bg-slate-900
        "
      >

        {/* Table header */}

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

          <div>
            <h2 className="font-semibold text-white">
              Assigned Projects
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Arbitrum smart contract audit assignments
            </p>
          </div>

          <span className="text-xs text-slate-500">
            {totalProjects} projects
          </span>

        </div>

        {/* Table */}

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

                <th className="px-6 py-4">
                  Project
                </th>

                <th className="px-6 py-4">
                  Token
                </th>

                <th className="px-6 py-4">
                  Contract Address
                </th>

                <th className="px-6 py-4">
                  Network
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Findings
                </th>

              </tr>

            </thead>

            <tbody>

              {projects.map((project) => {

                const findings =
                  project.findings.critical +
                  project.findings.high +
                  project.findings.medium +
                  project.findings.low +
                  project.findings.informational;

                return (

                  <tr
                    key={project.id}
                    className="
                      group
                      border-b border-slate-800/70
                      transition-all duration-200
                      hover:bg-slate-800/40
                    "
                  >

                    {/* Project */}

                    <td className="px-6 py-4">

                      <p className="text-sm font-medium text-white transition-colors group-hover:text-cyan-400">
                        {project.project}
                      </p>

                    </td>

                    {/* Token */}

                    <td className="px-6 py-4 text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                      {project.token}
                    </td>

                    {/* Contract Address */}

                    <td className="px-6 py-4">

                      <div className="flex max-w-xs items-center gap-2">

                        <code className="truncate text-xs text-slate-400">
                          {project.contractAddress}
                        </code>

                        <button
                          onClick={() =>
                            copyAddress(
                              project.contractAddress,
                              project.id
                            )
                          }
                          title="Copy contract address"
                          className="
                            shrink-0 rounded-md
                            p-1.5
                            text-slate-600
                            transition-all duration-200
                            hover:bg-slate-800
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

                    </td>

                    {/* Network */}

                    <td className="px-6 py-4 text-sm text-slate-400 transition-colors group-hover:text-slate-300">
                      {project.network}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`
                          inline-flex rounded-full
                          border px-3 py-1
                          text-xs font-medium
                          transition-all duration-200
                          group-hover:brightness-110
                          ${statusStyles[project.status]}
                        `}
                      >
                        {project.status}
                      </span>

                    </td>

                    {/* Findings */}

                    <td className="px-6 py-4">

                      <span className="text-sm font-semibold text-white transition-colors group-hover:text-cyan-400">
                        {findings}
                      </span>

                    </td>

                  </tr>

                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}