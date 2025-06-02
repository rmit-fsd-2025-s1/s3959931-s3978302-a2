import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/shared/hooks/useAuth";

export const useLecturerAuth = () => {
  const { userData, isLoggedIn, isLoading } = useAuth();
  const [lecturerName, setLecturerName] = useState<string>("");
  const [currentLecturerId, setCurrentLecturerId] = useState<string>("");

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn || !userData) {
      redirect("/signin");
      return;
    }

    if (userData.role !== "lecturer") {
      redirect(userData.role === "tutor" ? "/tutor" : "/");
      return;
    }

    setLecturerName(userData.fullName || "Lecturer");
    setCurrentLecturerId(userData.id);
  }, [userData, isLoggedIn, isLoading]);

  return {
    lecturerName,
    currentLecturerId,
    isLoading,
  };
};
