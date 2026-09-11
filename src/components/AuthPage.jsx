import { useState } from "react";
import Field from "./Field";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name: "",email: "", password: "", });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const { login, signup } = useAuth();
  const isSignup = mode === "signup";
  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: null }));
    setAuthError(null);
  };

  const validate = () => {
    const next = {};

    if (isSignup && !form.name.trim()) {
      next.name = "Please enter your name.";
    }
    if (!form.email.trim()) {
      next.email = "Email is required.";
    }
    if (!form.password) {
      next.password = "Password is required.";
    } else if (isSignup && form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!validate()) return;
    setIsSubmitting(true);

    let result;
    if (isSignup) {
      result = signup(form.name, form.email, form.password);
    } else {
      result = login(form.email, form.password);
    }
    setIsSubmitting(false);
    if (result.success) {
      setSubmitMessage(
        isSignup
          ? "Account created successfully!"
          : "You've been signed in.",
      );
      setForm({ name: "", email: "", password: "" });
      setTimeout(() => setSubmitMessage(null), 3000);
    } else {
      setAuthError(result.error);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setAuthError(null);
    setSubmitMessage(null);

    if (next === "login") {
      setForm((f) => ({ ...f, name: "" }));
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F2EA]">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h2
            className="text-2xl mb-6 text-[#1B1F23] text-center"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} >
            {isSignup ? "Register" : "Login"}
          </h2>
          {submitMessage && (
            <div
              className="mb-6 p-3 bg-[#3F4B8C]/10 border border-[#3F4B8C] text-[#3F4B8C] text-sm rounded"
              role="status" >
              {submitMessage}
            </div>
          )}
          {authError && (
            <div
              className="mb-6 p-3 bg-[#B0473F]/10 border border-[#B0473F] text-[#B0473F] text-sm rounded"
              role="alert" >
              {authError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {isSignup && (
              <Field
                label="Name"
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            )}
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-wide text-[#7A7468] mb-1.5"
              >
                Password {isSignup && <span className="text-[#B0473F]">*</span>}
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder={isSignup ? "At least 8 characters" : "••••••••"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`w-full bg-transparent border rounded-none px-0 py-2 text-[15px] text-[#1B1F23] placeholder-[#B7B0A2] focus:outline-none focus:border-[#3F4B8C] transition-colors ${
                  errors.password ? "border-[#B0473F]" : "border-[#DDD6C8]"
                }`}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs text-[#B0473F] error-message"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 bg-[#1B1F23] text-[#F6F2EA] text-[15px] py-3 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3F4B8C] focus:ring-offset-2 focus:ring-offset-[#F6F2EA] ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#3F4B8C]"
              }`}  >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSignup ? "Create account" : "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#7A7468]">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "login" : "signup")}
              className="text-[#3F4B8C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3F4B8C] rounded"  >
              {isSignup ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );}
