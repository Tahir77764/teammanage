"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Loader from "@/components/Loader";
import Logo from "@/components/Logo";

function VerifyOTPForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(600);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome! Taking you to your dashboard...");
        const destination =
          data.redirectTo ||
          (data.role === "admin" ? "/admin/dashboard" : "/dashboard");
        router.push(destination);
        router.refresh();
      } else {
        toast.error(data.error || "OTP verification failed");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("New OTP sent to your email");
        setTimer(600);
      } else {
        toast.error(data.error || "Could not resend OTP");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo href={null} size="lg" showText={false} />
            </div>
            <h1 className="heading-2 mb-2">Verify Email</h1>
            <p className="text-gray-600">We sent a 6-digit code to</p>
            <p className="font-semibold text-gray-800 break-all">{email}</p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="form-group">
              <label className="label">Enter OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="input text-center text-3xl tracking-widest font-bold"
                required
                disabled={loading}
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-gray-700">Expires in</span>
              <span
                className={`font-mono font-bold text-lg ${
                  timer < 60 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {formatTime(timer)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full py-3 font-semibold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <p className="text-center text-sm text-gray-600">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-blue-600 font-semibold hover:text-blue-700 disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            </p>
            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<Loader />}>
      <VerifyOTPForm />
    </Suspense>
  );
}
