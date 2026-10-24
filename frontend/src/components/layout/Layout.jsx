import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <Topbar />

      <main className="ml-64 min-h-screen pt-16">
        {children}
      </main>
    </div>
  );
}