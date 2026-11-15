import "./screen.css";

export interface SwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

/**
 * A flat label-plus-toggle row, used inside parent settings cards. The
 * toggle is a styled checkbox so keyboard and switch semantics stay free.
 */
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <label className="switch switch--flat">
      <span className="switch__label">{label}</span>
      <input
        className="switch__input"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  );
}
