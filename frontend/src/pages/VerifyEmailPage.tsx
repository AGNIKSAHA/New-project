import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useResendVerification, useVerifyEmail } from "../features/auth/authHooks";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();
  const autoVerifiedRef = useRef(false);

  useEffect(() => {
    if (autoVerifiedRef.current) {
      return;
    }

    const qpEmail = searchParams.get("email");
    const qpToken = searchParams.get("token");
    if (qpEmail && qpToken) {
      autoVerifiedRef.current = true;
      verifyEmail.mutate({ email: qpEmail, token: qpToken });
    }
  }, [searchParams]);

  useEffect(() => {
    if (verifyEmail.isSuccess) {
      navigate("/login", { replace: true });
    }
  }, [verifyEmail.isSuccess, navigate]);

  const onVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await verifyEmail.mutateAsync({ email, token });
    } catch {
      toast.error("Email verification failed");
    }
  };

  const onResend = async (): Promise<void> => {
    try {
      await resend.mutateAsync(email);
    } catch {
      toast.error("Resend failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Verify Email</h1>
      <form className="mt-6 space-y-4" onSubmit={onVerify}>
        <div>
          <label htmlFor="verify-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="verify-email"
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
          <label htmlFor="verify-token" className="mb-1 block text-sm font-medium text-slate-700">
            Verification Token
          </label>
          <input
            id="verify-token"
            name="token"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste verification token"
            required
          />
        </div>

        <button className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white" disabled={verifyEmail.isPending}>
          {verifyEmail.isPending ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button
        type="button"
        className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2"
        onClick={onResend}
        disabled={resend.isPending || email.trim().length === 0}
      >
        {resend.isPending ? "Sending..." : "Resend Verification Email"}
      </button>

      <p className="mt-4 text-sm text-slate-600">
        Back to <Link to="/login" className="text-brand-700">Login</Link>
      </p>
    </div>
  );
};
