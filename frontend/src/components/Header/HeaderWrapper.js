import React from "react";
import "./HeaderStyles.css";

const HeaderWrapper = ({ children, className }) => {
  return <header className={`header-wrapper ${className}`}>{children}</header>;
};

export default HeaderWrapper;