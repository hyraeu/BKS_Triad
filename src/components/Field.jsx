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
        className="auth-label"
      >
        {label}
        {required && <span className="auth-required">*</span>}
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
        className={`auth-input ${error ? "auth-input-error" : ""}`}
        {...props}
      />
      {error && (
        <p
          id={`${fieldId}-error`}
          className="auth-field-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}