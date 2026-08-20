import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, LayoutDashboard, LogOut, Send, SquarePen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const items = [
  { to: "/builder/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/builder/forms", label: "Form Builder", icon: SquarePen },
  { to: "/builder/published", label: "Published Forms", icon: Send },
  { to: "/builder/submissions", label: "Submissions", icon: FileText }
];

export const BuilderLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white/90 p-6 backdrop-blur">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-700">Portal</p>
          <h1 className="text-2xl font-semibold">Form Builder</h1>
        </div>
        <nav className="space-y-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          className="mt-8 flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-600 hover:bg-slate-100"
          onClick={() => {
            logout();
            navigate("/builder/login");
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <main className="p-4 lg:p-8">
        <div className="mb-6 flex items-center justify-between rounded-3xl bg-white/80 p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Administrator</p>
            <h2 className="text-xl font-semibold">{user?.name ?? "Admin User"}</h2>
          </div>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
