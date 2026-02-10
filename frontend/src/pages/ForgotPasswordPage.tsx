import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useForgotPassword } from "../features/auth/authHooks";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const forgot = useForgotPassword();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgot.mutateAsync({ email });
    } catch {
      toast.error("Request failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        <button className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white" disabled={forgot.isPending}>
          {forgot.isPending ? "Sending..." : "Send Reset Email"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Have token? <Link to="/reset-password" className="text-brand-700">Reset Password</Link>
      </p>
    </div>
  );
};
