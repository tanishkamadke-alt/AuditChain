import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
} from "lucide-react";

import { useState } from "react";

import { findings } from "../data/findings";
import { projects } from "../data/projects";

const severityStyles = {
  Critical: {
    badge:
      "border-red-500/30 bg-red-500/10 text-red-400",
    icon: "text-red-400",
  },

  High: {
    badge:
      "border-orange-500/30 bg-orange-500/10 text-orange-400",
    icon: "text-orange-400",
  },

  Medium: {
    badge:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    icon: "text-yellow-400",
  },

  Low: {
    badge:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    icon: "text-blue-400",
  },

  Informational: {
    badge:
      "border-slate-500/30 bg-slate-500/10 text-slate-300",
    icon: "text-slate-300",
  },
};

function FindingCard({ finding }) {
  const style = severityStyles[finding.severity];

  return (
    <div
      className="
        group rounded-xl
        border border-slate-800
        bg-slate-900/60
        p-5
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-slate-700
        hover:bg-slate-900
      "
    >

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

        <div className="flex items-start gap-3">

          <div
            className="
              rounded-lg bg-slate-800
              p-2.5
              transition-all duration-200
              group-hover:bg-slate-700
            "
          >
            <Info
              className={`h-5 w-5 ${style.icon}`}
            />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-xs font-semibold text-slate-500">
                {finding.id}
              </span>

              <span
                className={`
                  rounded-full border
                  px-2.5 py-1
                  text-[10px] font-medium
                  ${style.badge}
                `}
              >
                {finding.severity}
              </span>

              <span
                className="
                  rounded-full border border-slate-700
                  bg-slate-800
                  px-2.5 py-1
                  text-[10px] font-medium
                  text-slate-400
                "
              >
                {finding.status}
              </span>

            </div>

            <h3 className="mt-2 text-sm font-semibold text-white transition-colors group-hover:text-cyan-400">
              {finding.title}
            </h3>

          </div>

        </div>

        <span className="text-[10px] text-slate-600">
          Project {finding.projectId}
        </span>

      </div>


      {/* DESCRIPTION */}
      <div className="mt-5">

        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Description
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          {finding.description}
        </p>

      </div>


      {/* RECOMMENDATION */}
      <div
        className="
          mt-4 rounded-lg
          border border-slate-800
          bg-slate-950/50
          p-4
          transition-all duration-200
          group-hover:border-slate-700
        "
      >

        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Recommendation
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          {finding.recommendation}
        </p>

      </div>

    </div>
  );
}

function SeverityCard({ title, count, icon: Icon, iconColor }) {
  return (
    <div
      className="
        group rounded-xl
        border border-slate-800
        bg-slate-900/60
        p-4
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-slate-700
        hover:bg-slate-900
      "
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            {title}
          </p>

          <p
            className="
              mt-2 text-2xl font-bold
              text-white
              transition-colors
              group-hover:text-cyan-400
            "
          >
            {count}
          </p>

        </div>

        <Icon
          className={`
            h-5 w-5
            transition-transform duration-200
            group-hover:scale-110
            ${iconColor}
          `}
        />

      </div>

    </div>
  );
}

export default function SecurityFindings() {
  const [selectedProject, setSelectedProject] =
    useState("all");

  const filteredFindings =
    selectedProject === "all"
      ? findings
      : findings.filter(
          (finding) =>
            finding.projectId === Number(selectedProject)
        );

  const critical = filteredFindings.filter(
    (finding) => finding.severity === "Critical"
  ).length;

  const high = filteredFindings.filter(
    (finding) => finding.severity === "High"
  ).length;

  const medium = filteredFindings.filter(
    (finding) => finding.severity === "Medium"
  ).length;

  const low = filteredFindings.filter(
    (finding) => finding.severity === "Low"
  ).length;

  const informational = filteredFindings.filter(
    (finding) => finding.severity === "Informational"
  ).length;

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <ShieldAlert className="h-4 w-4" />
            Security Analysis
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Security Findings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Review, classify and document security findings identified
            during smart contract audits.
          </p>

        </div>

        {/* PROJECT FILTER */}
        <div className="flex items-center gap-2">

          <Filter className="h-4 w-4 text-slate-600" />

          <select
            value={selectedProject}
            onChange={(event) =>
              setSelectedProject(event.target.value)
            }
            className="
              rounded-lg
              border border-slate-800
              bg-slate-900
              px-4 py-2.5
              text-xs text-slate-300
              outline-none
              transition-all duration-200
              hover:border-slate-700
              focus:border-cyan-500/50
              focus:ring-1 focus:ring-cyan-500/20
            "
          >
            <option value="all">
              All Projects
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                Project {project.id} — {project.token}
              </option>
            ))}

          </select>

        </div>

      </div>


      {/* SEVERITY OVERVIEW */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SeverityCard
          title="Critical"
          count={critical}
          icon={ShieldAlert}
          iconColor="text-red-400"
        />

        <SeverityCard
          title="High"
          count={high}
          icon={AlertTriangle}
          iconColor="text-orange-400"
        />

        <SeverityCard
          title="Medium"
          count={medium}
          icon={AlertTriangle}
          iconColor="text-yellow-400"
        />

        <SeverityCard
          title="Low"
          count={low}
          icon={AlertTriangle}
          iconColor="text-blue-400"
        />

        <SeverityCard
          title="Informational"
          count={informational}
          icon={Info}
          iconColor="text-slate-400"
        />

      </div>


      {/* FINDINGS HEADER */}
      <div
        className="
          mt-7 rounded-xl
          border border-slate-800
          bg-slate-900/60
          px-6 py-5
          transition-all duration-200
          hover:border-slate-700
          hover:bg-slate-900
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-semibold text-white">
              Audit Findings
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Documented security observations across the audit scope.
            </p>

          </div>

          <span className="text-xs text-slate-500">
            {filteredFindings.length} findings
          </span>

        </div>

      </div>


      {/* FINDINGS LIST */}
      <div className="mt-4 space-y-4">

        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
            />
          ))
        ) : (
          <div
            className="
              rounded-xl
              border border-slate-800
              bg-slate-900/60
              p-10
              text-center
            "
          >

            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />

            <p className="mt-3 text-sm font-medium text-white">
              No findings recorded
            </p>

            <p className="mt-1 text-xs text-slate-600">
              No security findings have been documented for this project yet.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}