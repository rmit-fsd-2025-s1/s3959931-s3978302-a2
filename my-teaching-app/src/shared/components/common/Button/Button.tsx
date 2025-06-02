import React from "react";
import styles from "./Button.module.css"; // Import the CSS module

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline"; // Add other variants if needed
  // Add any other custom props here
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary", // Default variant
  className, // Allow passing additional classes
  ...props
}) => {
  const buttonClasses = [
    styles.btn, // Base button style
    variant === "primary" && styles.btnPrimary,
    variant === "outline" && styles.btnOutline,
    className, // User-provided classes
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
