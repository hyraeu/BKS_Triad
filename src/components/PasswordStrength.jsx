export default function PasswordStrength({ password }) {
  if (!password || password.length === 0) return null;

  const getStrength = (pwd) => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;

    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const getStrengthLabel = (s) => {
    if (s <= 1) return { label: "Weak", color: "strength-value-weak" };
    if (s <= 3) return { label: "Medium", color: "strength-value-medium" };
    return { label: "Strong", color: "strength-value-strong" };
  };

  const score = getStrength(password);
  const strength = getStrengthLabel(score);
  const getWidth = (s) => {
    if (s <= 1) return "w-1/3";
    if (s <= 3) return "w-2/3";
    return "w-full";
  };

  const getBarColor = (s) => {
    if (s <= 1) return "strength-weak";
    if (s <= 3) return "strength-medium";
    return "strength-strong";
  };
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center">
        <span className="strength-label">Password Strength</span>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <div className="strength-track">
        <div
          className={`strength-bar ${getBarColor(score)} ${getWidth(score)}`}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Password strength: ${strength.label}`}
        />
      </div>
      <ul className="strength-checklist">
        <li className={password.length >= 8 ? "strength-check-met" : ""}>
          {password.length >= 8 ? "✓" : "○"} 8+ characters
        </li>
        <li className={
            /[a-z]/.test(password) && /[A-Z]/.test(password)
              ? "strength-check-met" : ""}>
          {/[a-z]/.test(password) && /[A-Z]/.test(password) ? "✓" : "○"}{" "}
          Uppercase & Lowercase
        </li>
        <li className={/\d/.test(password) ? "strength-check-met" : ""}>
          {/\d/.test(password) ? "✓" : "○"} Number
        </li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? "strength-check-met" : ""}>
          {/[^a-zA-Z0-9]/.test(password) ? "✓" : "○"} Special character
        </li>
      </ul>
    </div>
  );
}
