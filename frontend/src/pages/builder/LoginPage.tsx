import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-lg"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await login(email, password);
            navigate("/builder/dashboard");
          } catch {
            setError("Invalid credentials");
          }
        }}
      >
        <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Admin Portal</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button className="mt-6 w-full rounded-2xl bg-teal-700 px-4 py-3 text-white">
          Login
        </button>
      </form>
    </div>
  );
};
