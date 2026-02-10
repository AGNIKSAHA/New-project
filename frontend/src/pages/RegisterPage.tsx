import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRegister } from "../features/auth/authHooks";
import type { UserRole } from "../types/api";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");

  const register = useRegister();
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }

    try {
      await register.mutateAsync({ name, email, password, role });
      navigate("/login", { replace: true });
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Register</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="register-name"
            name="name"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            minLength={2}
          />
        </div>
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="register-password"
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
        <div>
          <label htmlFor="register-confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            minLength={8}
          />
        </div>
        <div>
          <label htmlFor="register-role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="register-role"
            name="role"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole | "")}
            required
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="consumer">Consumer</option>
            <option value="shopkeeper">Shopkeeper</option>
          </select>
        </div>

        <button className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white" disabled={register.isPending}>
          {register.isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have a token? <Link to="/verify-email" className="text-brand-700">Verify Email</Link>
      </p>
    </div>
  );
};
