import React from "react";
import "./SignFormStyles.css";

function SignFormInput({ type, options, ...restProps }) {
  return type === "select" ? (
    <select className="sign-form-input" {...restProps}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ) : (
    <input className="sign-form-input" type={type} {...restProps} />
  );
}

export default SignFormInput;
