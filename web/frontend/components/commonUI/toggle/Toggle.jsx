import "./toggle.css";

export function Toggle({ isOn, handleToggle, featureName }) {
  return (
    <div className="toggle-container">
      <input
        type="checkbox"
        checked={isOn}
        onChange={handleToggle}
        className="toggle-input"
        id={`toggle-switch-${featureName}`}
      />
      <label className="toggle-label" htmlFor={`toggle-switch-${featureName}`}>
        <span className="toggle-button"></span>
      </label>
    </div>
  );
}
