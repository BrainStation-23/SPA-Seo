import React from "react";

import { useEffect, useRef } from "react";
import "trix/dist/trix.css";
import "trix";

export default function TrixEditor({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleChange = (event) => {
      onChange(event.target.value);
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("trix-change", handleChange);
    }

    // Cleanup
    return () => {
      if (inputElement) {
        inputElement.removeEventListener("trix-change", handleChange);
      }
    };
  }, [onChange]);

  return (
    <div className="trix-editor-container">
      <input
        type="hidden"
        ref={inputRef}
        id="trix-input"
        value={value}
        onChange={() => {}}
      />
      <trix-editor input="trix-input" />
    </div>
  );
}
