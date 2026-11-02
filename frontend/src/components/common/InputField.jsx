/**
 * InputField.jsx — Labelled form input with validation display.
 *
 * Props:
 *   label, id, error, helper, required, iconLeft, iconRight, ...inputProps
 */
export default function InputField({
  label,
  id,
  error,
  helper,
  required = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  onIconRightClick,
  className = '',
  type = 'text',
  ...inputProps
}) {
  const hasIconLeft  = !!IconLeft;
  const hasIconRight = !!IconRight;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className={`form-label${required ? ' required' : ''}`}>
          {label}
        </label>
      )}

      <div className={hasIconLeft || hasIconRight ? 'input-wrapper' : undefined}>
        {hasIconLeft && (
          <span className="input-icon-left" aria-hidden="true">
            <IconLeft size={16} />
          </span>
        )}

        <input
          id={id}
          type={type}
          className={[
            'form-input',
            error ? 'error' : '',
            hasIconLeft  ? 'has-icon-left'  : '',
            hasIconRight ? 'has-icon-right' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          {...inputProps}
        />

        {hasIconRight && (
          <button
            type="button"
            className="input-icon-right"
            onClick={onIconRightClick}
            tabIndex={-1}
            aria-label="Toggle"
          >
            <IconRight size={16} />
          </button>
        )}
      </div>

      {error && (
        <span id={`${id}-error`} className="form-error" role="alert">
          {error}
        </span>
      )}
      {!error && helper && (
        <span id={`${id}-helper`} className="form-helper">
          {helper}
        </span>
      )}
    </div>
  );
}
