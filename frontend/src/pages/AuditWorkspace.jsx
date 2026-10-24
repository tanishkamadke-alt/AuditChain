import {
  ArrowLeft,
  ShieldCheck,
  FileCode2,
  Network,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Activity,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { projects } from "../data/projects";
import { findings } from "../data/findings";

export default function AuditWorkspace() {
  const { projectId } = useParams();

  const project = projects.find(
    (item) => item.id === Number(projectId)
  );

  if (!project) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <h1 className="text-lg font-semibold text-red-400">
            Project Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested audit project does not exist.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
            Audit Workspace
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Smart Contract Security Audit
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Review contract architecture, source code, privileged functions,
            security controls and audit findings.
          </p>
        </div>

        <button
          className="
            flex items-center justify-center gap-2
            rounded-lg border border-slate-800
            bg-slate-900 px-4 py-2.5
            text-sm text-slate-400
            transition-all duration-200
            hover:border-cyan-500/30
            hover:bg-slate-800
            hover:text-cyan-400
            active:scale-[0.98]
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

      </div>


      {/* PROJECT IDENTITY */}
      <div
        className="
          mt-7 rounded-xl
          border border-cyan-500/20
          bg-cyan-500/5
          p-6
          transition-all duration-200
          hover:border-cyan-500/40
          hover:bg-cyan-500/10
        "
      >

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-xl font-semibold text-white">
                {project.project.replace(`Project ${project.id} — `, "")}
              </h2>

              <span
                className="
                  rounded-full border border-cyan-500/30
                  bg-cyan-500/10 px-2.5 py-1
                  text-[10px] font-medium text-cyan-400
                "
              >
                {project.token}
              </span>

              <span
                className="
                  rounded-full border border-cyan-500/30
                  bg-cyan-500/10 px-2.5 py-1
                  text-[10px] font-medium text-cyan-400
                "
              >
                {project.status}
              </span>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Project {project.id} • {project.network}
            </p>

          </div>

          <a
            href={`https://arbiscan.io/address/${project.contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center gap-2
              text-xs text-slate-400
              transition-colors
              hover:text-cyan-400
            "
          >
            View on Arbiscan
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

        </div>

        <div
          className="
            mt-5 rounded-lg
            border border-slate-800
            bg-slate-950/70
            p-4
            transition-all duration-200
            hover:border-slate-700
          "
        >

          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Contract Address
          </p>

          <code className="mt-2 block break-all text-xs text-slate-300">
            {project.contractAddress}
          </code>

        </div>

      </div>


      {/* AUDIT STATUS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div
          className="
            group rounded-xl border border-slate-800
            bg-slate-900/60 p-5
            transition-all duration-200
            hover:-translate-y-1
            hover:border-cyan-500/30
            hover:bg-slate-900
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Audit Status
              </p>

              <p className="mt-2 text-lg font-semibold text-cyan-400">
                {project.status}
              </p>
            </div>

            <Activity className="h-5 w-5 text-cyan-400 transition-transform group-hover:scale-110" />

          </div>
        </div>


        <div
          className="
            group rounded-xl border border-slate-800
            bg-slate-900/60 p-5
            transition-all duration-200
            hover:-translate-y-1
            hover:border-emerald-500/30
            hover:bg-slate-900
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Confirmed Issues
              </p>

              <p className="mt-2 text-lg font-semibold text-emerald-400">
                {project.findings.critical +
                project.findings.high +
                project.findings.medium +
                project.findings.low}
              </p>
            </div>

            <CheckCircle2 className="h-5 w-5 text-emerald-400 transition-transform group-hover:scale-110" />

          </div>
        </div>


        <div
          className="
            group rounded-xl border border-slate-800
            bg-slate-900/60 p-5
            transition-all duration-200
            hover:-translate-y-1
            hover:border-amber-500/30
            hover:bg-slate-900
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Informational
              </p>

              <p className="mt-2 text-lg font-semibold text-amber-400">
                {project.findings.informational}
              </p>
            </div>

            <AlertTriangle className="h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />

          </div>
        </div>


        <div
          className="
            group rounded-xl border border-slate-800
            bg-slate-900/60 p-5
            transition-all duration-200
            hover:-translate-y-1
            hover:border-slate-700
            hover:bg-slate-900
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Compiler
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {project.compilerVersion || "Not reviewed"}
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-slate-400 transition-transform group-hover:scale-110" />

          </div>
        </div>

      </div>


      {/* AUDIT WORKFLOW */}
      <div className="mt-6">

        <div>
          <h2 className="font-semibold text-white">
            Audit Workflow
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Security review areas for the current contract
          </p>
        </div>


        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {/* SOURCE CODE */}
          <div
            className="
              group rounded-xl border border-slate-800
              bg-slate-900/60 p-5
              transition-all duration-200
              hover:-translate-y-1
              hover:border-cyan-500/30
              hover:bg-slate-900
            "
          >

            <div className="flex items-start justify-between">

              <div className="rounded-lg bg-slate-800 p-2.5 text-cyan-400 transition-all group-hover:bg-cyan-500/10">
                <FileCode2 className="h-5 w-5" />
              </div>

              <span className={`text-[10px] font-medium ${(project.reviewSections?.sourceCode || (project.status === "Completed" ? "Reviewed" : "Pending")) === "Reviewed" ? "text-emerald-400" : "text-amber-400"}`}>
                {project.reviewSections?.sourceCode || (project.status === "Completed" ? "Reviewed" : "Pending")}
              </span>

            </div>

            <h3 className="mt-4 font-semibold text-white">
              Source Code Review
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Verified implementation, dependencies, compiler configuration
              and contract structure.
            </p>

          </div>


          {/* ARCHITECTURE */}
          <div
            className="
              group rounded-xl border border-slate-800
              bg-slate-900/60 p-5
              transition-all duration-200
              hover:-translate-y-1
              hover:border-cyan-500/30
              hover:bg-slate-900
            "
          >

            <div className="flex items-start justify-between">

              <div className="rounded-lg bg-slate-800 p-2.5 text-cyan-400 transition-all group-hover:bg-cyan-500/10">
                <Network className="h-5 w-5" />
              </div>

              <span className={`text-[10px] font-medium ${(project.reviewSections?.architecture || (project.status === "Completed" ? "Reviewed" : "Pending")) === "Reviewed" ? "text-emerald-400" : "text-amber-400"}`}>
                {project.reviewSections?.architecture || (project.status === "Completed" ? "Reviewed" : "Pending")}
              </span>

            </div>

            <h3 className="mt-4 font-semibold text-white">
              Architecture Review
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Proxy architecture, implementation contract, bridge gateway
              and control relationships.
            </p>

          </div>


          {/* PRIVILEGED FUNCTIONS */}
          <div
            className="
              group rounded-xl border border-slate-800
              bg-slate-900/60 p-5
              transition-all duration-200
              hover:-translate-y-1
              hover:border-cyan-500/30
              hover:bg-slate-900
            "
          >

            <div className="flex items-start justify-between">

              <div className="rounded-lg bg-slate-800 p-2.5 text-cyan-400 transition-all group-hover:bg-cyan-500/10">
                <KeyRound className="h-5 w-5" />
              </div>

              <span className={`text-[10px] font-medium ${(project.reviewSections?.privilegedFunctions || (project.status === "Completed" ? "Reviewed" : "Pending")) === "Reviewed" ? "text-emerald-400" : "text-amber-400"}`}>
                {project.reviewSections?.privilegedFunctions || (project.status === "Completed" ? "Reviewed" : "Pending")}
              </span>

            </div>

            <h3 className="mt-4 font-semibold text-white">
              Privileged Functions
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Owner, pauser, blacklister, gateway and proxy administration
              controls.
            </p>

          </div>

        </div>

      </div>


      {/* SECURITY FINDINGS */}
      <div
        className="
          mt-6 rounded-xl
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
            <h2 className="font-semibold text-white">
              Security Findings
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current findings identified during the audit
            </p>
          </div>

          <span className="text-xs text-slate-500">
            {project.findings.informational} observations
          </span>

        </div>

        <div className="mt-5 space-y-3">
          {findings.filter((finding) => finding.projectId === project.id).length > 0 ? (
            findings.filter((finding) => finding.projectId === project.id).map((finding) => (
              <div key={finding.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-all duration-200 hover:border-amber-500/30 hover:bg-amber-500/5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{finding.id} · {finding.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{finding.description}</p>
                      {finding.evidence && <p className="mt-2 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-400">Evidence: </span>{finding.evidence}</p>}
                      <p className="mt-2 text-xs leading-5 text-slate-500"><span className="font-semibold text-cyan-400">Recommendation: </span>{finding.recommendation}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-400">{finding.severity} · {finding.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-3">
                <Clock3 className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-sm text-slate-300">{project.status === "Completed" ? "No findings recorded for this completed review." : "No findings recorded yet — this does not mean the contract is vulnerability-free."}</p>
                  <p className="mt-1 text-xs text-slate-500">Findings will appear here as the review progresses.</p>
                </div>
              </div>
            </div>
          )}
        </div>
</div>
        
      {/* AUDIT RESULT */}
      <div
        className="
          mt-6 rounded-xl
          border border-emerald-500/20
          bg-emerald-500/5
          p-6
          transition-all duration-200
          hover:border-emerald-500/40
          hover:bg-emerald-500/10
        "
      >

        <div className="flex items-start gap-4">

          <div className="rounded-lg bg-emerald-500/10 p-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>

          <div>

            <h2 className="font-semibold text-emerald-400">
              Audit Result
            </h2>

            <p className="mt-2 text-sm font-medium text-white">
                {project.status === "Completed"
                    ? "Audit Completed"
                    : "Audit In Progress"}
            </p>

            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
                {project.status === "Completed"
                    ? "The security review for this project has been completed."
                    : "This workspace shows the observations reviewed so far. The audit remains in progress; absence of a confirmed high-severity issue is not a guarantee that the contract is vulnerability-free."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}