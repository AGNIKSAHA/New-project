import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLogin } from "../features/auth/authHooks";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate(from, { replace: true });
    } catch {
      toast.error("Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            minLength={8}
          />
        </div>
        <button className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white" disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need an account? <Link to="/register" className="text-brand-700">Register</Link>
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Forgot password? <Link to="/forgot-password" className="text-brand-700">Reset here</Link>
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Need email verification? <Link to="/verify-email" className="text-brand-700">Verify email</Link>
      </p>
    </div>
  );
};
