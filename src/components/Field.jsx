/**
 * Reusable form field component
 * Demonstrates component extraction and reusability
 */

export default function Field({
  label,
  error,
  type = "text",
  id,
  autoComplete,
  placeholder,
  value,
  onChange,
  required = false,
  ...props
}) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="field-wrapper">
      <label
        htmlFor={fieldId}
        className="block text-xs uppercase tracking-wide text-[#7A7468] mb-1.5"
      >
        {label}
        {required && <span className="text-[#B0473F] ml-1">*</span>}
      </label>

      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`w-full bg-transparent border rounded-none px-0 py-2 text-
            [15px] text-[#1B1F23] placeholder-[#B7B0A2] focus:outline-none focus:border-[
            #3F4B8C] transition-colors ${
              error ? "border-[#B0473F]" : "border-[#DDD6C8]"
            }`}
        {...props}
      />

      {error && (
        <p
          id={`${fieldId}-error`}
          className="mt-1.5 text-xs text-[#B0473F] error-message"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
