import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-lg"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");

          if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
          }

          try {
            await register(name.trim(), email.trim(), password);
            navigate("/builder/dashboard");
          } catch (requestError: any) {
            setError(
              requestError?.response?.data?.detail ?? "Unable to create your account"
            );
          }
        }}
      >
        <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold">Register and set your password</h1>
        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
          />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button className="mt-6 w-full rounded-2xl bg-teal-700 px-4 py-3 text-white">
          Create account
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-medium text-teal-700" to="/builder/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};
