import { useState, useRef } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import Field from "./Field";
import PasswordStrength from "./PasswordStrength";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [authError, setAuthError] = useState(null);
  const { login, signup, sessionError } = useAuth();
  const isSignup = mode === "signup";
  const authErrorTimer = useRef(null);

  const clearAuthError = () => {
    if (authErrorTimer.current) clearTimeout(authErrorTimer.current);
    authErrorTimer.current = null;
    setAuthError(null);
  };

  const showAuthError = (message) => {
    if (authErrorTimer.current) clearTimeout(authErrorTimer.current);
    setAuthError(message);
    authErrorTimer.current = setTimeout(() => {
      setAuthError(null);
      authErrorTimer.current = null;
    }, 5000);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: null }));
  };

  const validate = () => {
    const next = {};

    if (isSignup && !form.name.trim()) {
      next.name = "Please enter your name.";
    } else if (isSignup && !/^[\p{L}\p{M}\s'‘’\-]+$/u.test(form.name)) {
      next.name = "Name contains invalid characters.";
    } else if (isSignup && form.name.length > 40) {
      next.name = "Name must be under 40 characters.";
    }

    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      next.password = "Password is required.";
    } else if (isSignup && form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    } else if (isSignup && form.password.length > 16) {
      next.password = "Password must be under 16 characters.";
    }

    if (isSignup) {
      if (!form.confirmPassword) {
        next.confirmPassword = "Please confirm your password.";
      } else if (form.password !== form.confirmPassword) {
        next.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitMessage(null);

    const startedAt = Date.now();
    let result;

    if (isSignup) {
      result = await signup(form.name, form.email, form.password);
    } else {
      result = await login(form.email, form.password);
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < 1500) {
      await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
    }

    setIsSubmitting(false);

    if (result.success) {
      setSubmitMessage(
        isSignup
          ? "Account Created Successfully!"
          : "You've Been Signed In.",
      );

      setForm({ name: "", email: "", password: "", confirmPassword: "" });

      setTimeout(() => setSubmitMessage(null), 3000);
    } else {
      showAuthError(result.error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    clearAuthError();
    setSubmitMessage(null);

    if (next === "login") {
      setForm((f) => ({ ...f, name: "", confirmPassword: "" }));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
          <h2
            className="auth-title"
          >
            {isSignup ? "Sign Up" : "Log In"}
          </h2>

          {sessionError && (
            <div className="auth-message auth-message-error" role="alert">
              {sessionError}
            </div>
          )}

          {authError && (
            <div
              className="auth-message auth-message-error"
              role="alert"
            >
              {authError}
              <button
                type="button"
                onClick={clearAuthError}
                aria-label="Dismiss error"
                className="auth-dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {submitMessage && (
            <div
              className="auth-message auth-message-success"
              role="status"
            >
              {submitMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            className="auth-form"
          >
            {isSignup && (
              <Field
                label="Name"
                type="text"
                name="fullname_field"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
                autoComplete="off"
                maxLength={40}
                required
              />
            )}

            <Field
              label="Email"
              type="email"
              name="email_field"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
              autoComplete="off"
              required
            />

            <div>
              <label
                htmlFor="password"
                className="auth-label"
              >
                Password <span className="auth-required">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password_field"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  //placeholder={isSignup ? "8-16 Characters" : "••••••••"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={16}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={`auth-input auth-password-input ${
                    errors.password ? "auth-input-error" : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {errors.password && (
                <p
                  id="password-error"
                  className="auth-field-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}

              {isSignup && form.password && (
                <PasswordStrength password={form.password} />
              )}

            </div>

            {isSignup && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="auth-label"
                >
                  Confirm Password <span className="auth-required">*</span>
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirm_password_field"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={16}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                    className={`auth-input auth-password-input ${
                      errors.confirmPassword ? "auth-input-error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="auth-password-toggle"
                    aria-label={
                      showConfirmPassword
                        ? "Hide Confirmation Password"
                        : "Show Confirmation Password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="auth-field-error"
                    role="alert"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`auth-submit ${
                isSubmitting
                  ? "auth-submit-disabled"
                  : ""
              }`}
            >
              {isSubmitting ? (
                isSignup ? "Creating Account..." : "Logging In..."
              ) : (
                isSignup ? "Create Account" : "Log In"
              )}
            </button>
          </form>

          <p className="auth-switch-prompt">
            {isSignup ? "Already Have An Account?" : "Need An Account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "login" : "signup")}
              className="auth-link"
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </p>
      </section>
    </main>
  );
}
