import React from "react";
import styles from "./Card.module.css"; // Import the CSS module

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Add any other custom props for the Card component here
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  const cardClasses = [
    styles.card, // Base card style
    className, // User-provided classes
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
