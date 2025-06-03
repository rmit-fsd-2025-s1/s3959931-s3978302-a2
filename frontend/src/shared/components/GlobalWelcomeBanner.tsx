"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { WelcomeBanner } from "./WelcomeBanner";

const LOGOUT_FLAG_KEY = "welcomeBanner_hasLoggedOut";

const GlobalWelcomeBannerInternal: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const previousAuthState = useRef<boolean | null>(null); // Start with null to detect first mount
  const currentUserId = useRef<number | null>(null);

  // Helper functions for localStorage
  const getLogoutFlag = () => {
    if (typeof window !== "undefined") {
      const flag = localStorage.getItem(LOGOUT_FLAG_KEY) === "true";
      console.log(`[GlobalWelcomeBanner] getLogoutFlag: ${flag}`);
      return flag;
    }
    return false;
  };

  const setLogoutFlag = (value: boolean) => {
    if (typeof window !== "undefined") {
      console.log(`[GlobalWelcomeBanner] setLogoutFlag: ${value}`);
      if (value) {
        localStorage.setItem(LOGOUT_FLAG_KEY, "true");
      } else {
        localStorage.removeItem(LOGOUT_FLAG_KEY);
      }
    }
  };

  // Extract user ID for dependency array to prevent infinite loops
  const userId = user?.id;

  // Memoize user object to prevent unnecessary re-renders
  const memoizedUser = useMemo(
    () => user,
    [userId, user?.firstName, user?.lastName, user?.email]
  );

  useEffect(() => {
    console.log(`[GlobalWelcomeBanner] useEffect triggered`, {
      isAuthenticated,
      user: user ? { id: user.id, firstName: user.firstName } : null,
      isLoading,
      previousAuthState: previousAuthState.current,
      currentUserId: currentUserId.current,
    });

    if (isAuthenticated && user && !isLoading) {
      const isFirstMount = previousAuthState.current === null;
      const wasNotAuthenticated = previousAuthState.current === false;
      const isDifferentUser = currentUserId.current !== user.id;
      const wasLoggedOut = getLogoutFlag();

      console.log(`[GlobalWelcomeBanner] Auth conditions:`, {
        isFirstMount,
        wasNotAuthenticated,
        isDifferentUser,
        wasLoggedOut,
        shouldShow:
          (isFirstMount && wasLoggedOut) ||
          wasNotAuthenticated ||
          isDifferentUser ||
          wasLoggedOut,
      });

      // Show banner if:
      // - Component is freshly mounted and user was logged out previously, OR
      // - User wasn't authenticated before, OR
      // - User is different from the previous user, OR
      // - User had logged out previously
      if (
        (isFirstMount && wasLoggedOut) ||
        wasNotAuthenticated ||
        isDifferentUser ||
        wasLoggedOut
      ) {
        console.log(`[GlobalWelcomeBanner] Showing banner in 300ms...`);
        const timer = setTimeout(() => {
          console.log(`[GlobalWelcomeBanner] Setting showBanner to true`);
          setShowBanner(true);
        }, 300);

        previousAuthState.current = true;
        currentUserId.current = user.id;
        setLogoutFlag(false); // Reset logout flag once banner is shown

        return () => {
          clearTimeout(timer);
        };
      } else if (isFirstMount) {
        // First mount but no logout flag - just update refs without showing banner
        console.log(
          `[GlobalWelcomeBanner] First mount without logout flag, updating refs only`
        );
        previousAuthState.current = true;
        currentUserId.current = user.id;
      }
    } else if (!isAuthenticated && !isLoading) {
      console.log(`[GlobalWelcomeBanner] User logged out or not authenticated`);
      // User has logged out or session expired
      if (previousAuthState.current === true) {
        console.log(
          `[GlobalWelcomeBanner] Setting logout flag because user was previously authenticated`
        );
        setLogoutFlag(true); // Mark that user has logged out
      }
      previousAuthState.current = false;
      currentUserId.current = null;
      if (showBanner) {
        console.log(`[GlobalWelcomeBanner] Hiding banner`);
        setShowBanner(false); // Immediately hide banner when logged out
      }
    }
  }, [isAuthenticated, userId, isLoading]); // Use userId instead of user object

  const handleBannerHide = useCallback(() => {
    console.log(`[GlobalWelcomeBanner] Banner manually hidden`);
    setShowBanner(false);
  }, []);

  console.log(`[GlobalWelcomeBanner] Render:`, {
    showBanner,
    isAuthenticated,
    user: user ? { id: user.id, firstName: user.firstName } : null,
    isLoading,
  });

  if (!showBanner) {
    return null;
  }

  if (!isAuthenticated || !memoizedUser || isLoading) {
    return null;
  }

  return (
    <WelcomeBanner
      user={memoizedUser}
      autoHideDelay={5000}
      onHide={handleBannerHide}
    />
  );
};

export default GlobalWelcomeBannerInternal;
