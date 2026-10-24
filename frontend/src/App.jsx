import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import AuditProjects from "./pages/AuditProjects";
import AuditWorkspace from "./pages/AuditWorkspace";
import SecurityFindings from "./pages/SecurityFindings";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/projects" element={<AuditProjects />} />

          <Route
          path="/workspace/:projectId"
          element={<AuditWorkspace />}
          />

          <Route path="/findings" element={<SecurityFindings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;