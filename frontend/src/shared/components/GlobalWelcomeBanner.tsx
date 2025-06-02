"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { WelcomeBanner } from "./WelcomeBanner";

const GlobalWelcomeBannerInternal: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const previousAuthState = useRef(false);
  const currentUserId = useRef<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const wasNotAuthenticated = !previousAuthState.current;
      const isDifferentUser = currentUserId.current !== user.id;

      if (wasNotAuthenticated || isDifferentUser) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 300);

        previousAuthState.current = true;
        currentUserId.current = user.id;

        return () => {
          clearTimeout(timer);
        };
      }
    } else if (!isAuthenticated && !isLoading) {
      previousAuthState.current = false;
      currentUserId.current = null;
      if (showBanner) {
        setShowBanner(false);
      }
    }
  }, [isAuthenticated, user, isLoading, showBanner]);

  const handleBannerHide = useCallback(() => {
    setShowBanner(false);
  }, []);

  if (!showBanner) {
    return null;
  }

  if (!isAuthenticated || !user || isLoading) {
    return null;
  }

  return (
    <WelcomeBanner user={user} autoHideDelay={5000} onHide={handleBannerHide} />
  );
};

export default React.memo(GlobalWelcomeBannerInternal);
