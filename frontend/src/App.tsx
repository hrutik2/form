import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { BuilderLayout } from "./components/layout/BuilderLayout";
import { DashboardPage } from "./pages/builder/DashboardPage";
import { FormEditorPage } from "./pages/builder/FormEditorPage";
import { FormsListPage } from "./pages/builder/FormsListPage";
import { LoginPage } from "./pages/builder/LoginPage";
import { PublishedPage } from "./pages/builder/PublishedPage";
import { SubmissionsPage } from "./pages/builder/SubmissionsPage";
import { PublicFormPage } from "./pages/public/PublicFormPage";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/builder/dashboard" replace />} />
    <Route path="/builder/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<BuilderLayout />}>
        <Route path="/builder/dashboard" element={<DashboardPage />} />
        <Route path="/builder/forms" element={<FormsListPage />} />
        <Route path="/builder/forms/create" element={<FormEditorPage />} />
        <Route path="/builder/forms/:id/edit" element={<FormEditorPage />} />
        <Route path="/builder/published" element={<PublishedPage />} />
        <Route path="/builder/submissions" element={<SubmissionsPage />} />
      </Route>
    </Route>
    <Route path="/form" element={<PublicFormPage />} />
  </Routes>
);

export default App;
