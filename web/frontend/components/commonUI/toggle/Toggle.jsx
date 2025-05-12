import React from "react";
import "./toggle.css";

export function Toggle({ isOn, handleToggle }) {
  return (
    <div className="toggle-container">
      <input
        type="checkbox"
        checked={isOn}
        onChange={handleToggle}
        className="toggle-input"
        id="toggle-switch"
      />
      <label className="toggle-label" htmlFor="toggle-switch">
        <span className="toggle-button"></span>
      </label>
    </div>
  );
}
