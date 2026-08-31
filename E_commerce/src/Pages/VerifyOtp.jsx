import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { KeyRound, ArrowRight, RefreshCw, Mail, CheckCircle2 } from "lucide-react";

export default function VerifyOtp() {
  const { verifyOtp, resendOtp, pendingEmail } = useAuth();
  const { error, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get("email");
  const email = emailFromQuery || pendingEmail || "";

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleDigitChange = (index, value) => {
    // Only accept numeric digits
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...otpDigits];

    // Handle paste event of full 6 digit string
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length !== 6) {
      error("Please enter all 6 digits of the OTP code");
      return;
    }

    if (!email) {
      error("Missing email address for verification");
      return;
    }

    setLoading(true);
    const result = await verifyOtp(email, fullOtp);
    setLoading(false);

    if (result?.success) {
      navigate("/");
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setCanResend(false);
    setResendTimer(60);
    await resendOtp(email);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50 dark:bg-neutral-950">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 text-white">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
            Verify Your Email
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
            We’ve sent a 6-digit one-time passcode to{" "}
            <span className="font-bold text-neutral-900 dark:text-white">{email || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm shadow-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : "Verify & Activate Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Resend OTP Timer & Trigger */}
        <div className="flex items-center justify-between mt-6 text-xs text-neutral-500">
          <div>
            Didn't receive code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Resend Now
              </button>
            ) : (
              <span className="text-neutral-400 font-mono">
                Resend in {resendTimer}s
              </span>
            )}
          </div>

          <Link
            to="/register"
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            Change Email
          </Link>
        </div>
      </div>
    </div>
  );
}
