/**
 * Development utilities and error suppression
 * Only active in development mode
 */

if (process.env.NODE_ENV === "development") {
  // Suppress known HMR console errors that don't affect functionality
  const originalConsoleError = console.error;

  console.error = (...args) => {
    const errorMessage = args.join(" ");

    // Suppress known HMR errors
    if (
      errorMessage.includes("hotModuleReplacement.js") ||
      errorMessage.includes(
        "Cannot read properties of null (reading 'removeChild')"
      ) ||
      errorMessage.includes("HMR") ||
      errorMessage.includes("Fast Refresh")
    ) {
      // Optionally log to a development log instead
      if (process.env.DEBUG_HMR) {
        originalConsoleError("[HMR Debug]", ...args);
      }
      return;
    }

    // Allow all other errors through
    originalConsoleError(...args);
  };

  // Handle unhandled promise rejections that might be HMR-related
  // Only run on client side where window is available
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason?.message || event.reason || "";

      if (
        error.includes("hotModuleReplacement") ||
        error.includes("removeChild") ||
        error.includes("HMR")
      ) {
        event.preventDefault();

        if (process.env.DEBUG_HMR) {
          console.log("[HMR Debug] Suppressed unhandled rejection:", error);
        }
      }
    });
  }
}

export {};
