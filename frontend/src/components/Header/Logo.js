import React from "react";
import "./HeaderStyles.css";

function Logo({ children, ...restProps }) {
  return (
    <div>
      <a href="/browse" {...restProps}>
        {children}
        <img className="logo" href="/" src="./images/misc/unnamed.png" alt="medina logo" />
      </a>
    </div>
  );
}

export default Logo;
