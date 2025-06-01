import { useState, useEffect, useMemo } from "react";
import type { Application as TutorApplication } from "@/shared/types/application";
import {
  getApplicationsFromStorage as getApplications,
  saveApplicationToStorage as saveApplication,
  initializeDetailedApplicationsInStorage,
} from "@/modules/tutor/utils/applicationDisplay.utils";
import { availableCourses } from "@/shared/data/courses";

export const useApplicationManagement = () => {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [comment, setComment] = useState<string>("");
  const [rankedApplications, setRankedApplications] = useState<
    TutorApplication[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("none");

  useEffect(() => {
    initializeDetailedApplicationsInStorage();
    loadApplications();
  }, []);

  useEffect(() => {
    loadApplications();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "applications") {
        loadApplications();
      }
    };
    const handleApplicationUpdate = () => {
      loadApplications();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("applicationUpdated", handleApplicationUpdate);
    const intervalId = setInterval(loadApplications, 5000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("applicationUpdated", handleApplicationUpdate);
      clearInterval(intervalId);
    };
  }, []);

  const loadApplications = () => {
    const appData = getApplications();
    setApplications(appData);
    const ranked = appData.filter((app) => app.rank !== undefined);
    setRankedApplications(
      ranked.sort((a, b) => (a.rank || 999) - (b.rank || 999))
    );
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (selectedCourse && !app.courses.includes(selectedCourse)) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const courseMatches = app.courses.some((course) => {
          const courseInfo = availableCourses.find(
            (c: { code: string; name: string }) => c.code === course
          );
          return (
            courseInfo &&
            (courseInfo.code.toLowerCase().includes(query) ||
              courseInfo.name.toLowerCase().includes(query))
          );
        });
        return (
          app.fullName.toLowerCase().includes(query) ||
          courseMatches ||
          app.availability.toLowerCase().includes(query) ||
          app.skills.some((skill) => skill.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [applications, selectedCourse, searchQuery]);

  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      if (sortBy === "none") return 0;
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "availability")
        return a.availability.localeCompare(b.availability);
      if (sortBy === "date") {
        return (
          new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
        );
      }
      return 0;
    });
  }, [filteredApplications, sortBy]);

  const handleSelectApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setComment(application.comment || "");
  };

  const statistics = useMemo(() => {
    const totalApplications = applications.length;
    const selectedTutorApplications = applications.filter(
      (app) => app.selected
    ).length;
    const pendingTutorApplications = applications.filter(
      (app) => !app.selected
    ).length;
    const selectionRate =
      totalApplications > 0
        ? Math.round((selectedTutorApplications / totalApplications) * 100)
        : 0;

    return {
      totalApplications,
      selectedTutorApplications,
      pendingTutorApplications,
      selectionRate,
    };
  }, [applications]);

  return {
    applications,
    selectedCourse,
    setSelectedCourse,
    selectedApplication,
    setSelectedApplication,
    comment,
    setComment,
    rankedApplications,
    setRankedApplications,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortedApplications,
    loadApplications,
    handleSelectApplication,
    statistics,
    saveApplication,
  };
};
