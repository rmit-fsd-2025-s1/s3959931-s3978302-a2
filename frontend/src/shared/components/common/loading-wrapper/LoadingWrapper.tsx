import React from "react";
import styles from "./LoadingWrapper.module.css";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingMessage?: string;
  minHeight?: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  loadingMessage = "Loading...",
  minHeight = "200px",
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer} style={{ minHeight }}>
        <div className={styles.spinner}>
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loadingMessage}>{loadingMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
