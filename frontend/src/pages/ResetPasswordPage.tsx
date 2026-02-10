import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useResetPassword } from "../features/auth/authHooks";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = useResetPassword();
  const navigate = useNavigate();

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }

    try {
      await reset.mutateAsync({ email, token, newPassword });
      navigate("/login", { replace: true });
    } catch {
      toast.error("Reset failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="reset-email"
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
          <label htmlFor="reset-token" className="mb-1 block text-sm font-medium text-slate-700">
            Reset Token
          </label>
          <input
            id="reset-token"
            name="token"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste reset token"
            required
          />
        </div>
        <div>
          <label htmlFor="reset-new-password" className="mb-1 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <input
            id="reset-new-password"
            name="newPassword"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label htmlFor="reset-confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            id="reset-confirm-password"
            name="confirmPassword"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>

        <button className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white" disabled={reset.isPending}>
          {reset.isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Back to <Link to="/login" className="text-brand-700">Login</Link>
      </p>
    </div>
  );
};
