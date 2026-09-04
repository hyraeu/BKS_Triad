/**
 * Password strength indicator component
 * Stretch Goal #2: Password strength indicator
 */

export default function PasswordStrength({ password }) {
  if (!password || password.length === 0) return null;

  const getStrength = (pwd) => {
    let score = 0;

    // Length check
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    return score;
  };

  const getStrengthLabel = (s) => {
    if (s <= 1) return { label: "Weak", color: "red" };
    if (s <= 3) return { label: "Medium", color: "yellow" };
    return { label: "Strong", color: "#90EE90" };
  };

  const score = getStrength(password);
  const strength = getStrengthLabel(score);

  const getWidth = (s) => {
    if (s <= 1) return "w-1/3";
    if (s <= 3) return "w-2/3";
    return "w-full";
  };

  const getBarColor = (s) => {
    if (s <= 1) return "bg-[#B0473F]";
    if (s <= 3) return "bg-[#C9A45C]";
    return "bg-[#3F4B8C]";
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#7A7468]">Password strength</span>

        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      <div className="h-1 w-full bg-[#DDD6C8] rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(score)} ${getWidth(score)} transition-all duration-300 rounded-full`}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Password strength: ${strength.label}`}
        />
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-[#7A7468]">
        <li className={password.length >= 8 ? "text-[#3F4B8C]" : ""}>
          {password.length >= 8 ? "✓" : "○"} 8+ characters
        </li>
        <li className={
            /[a-z]/.test(password) && /[A-Z]/.test(password)
              ? "text-[#3F4B8C]" : ""}>
          {/[a-z]/.test(password) && /[A-Z]/.test(password) ? "✓" : "○"}{" "}
          Uppercase & lowercase
        </li>
        <li className={/\d/.test(password) ? "text-[#3F4B8C]" : ""}>
          {/\d/.test(password) ? "✓" : "○"} Number
        </li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? "text-[#3F4B8C]" : ""}>
          {/[^a-zA-Z0-9]/.test(password) ? "✓" : "○"} Special character
        </li>
      </ul>
    </div>
  );
}
