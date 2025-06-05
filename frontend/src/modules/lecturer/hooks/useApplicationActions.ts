import type { Application as TutorApplication } from "@/shared/types/application";
import { getMelbourneDateOnly } from "@/shared/utils/dateUtils";

interface UseApplicationActionsProps {
  selectedApplication: TutorApplication | null;
  comment: string;
  setComment: (comment: string) => void;
  currentLecturerId: string;
  loadApplications: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  saveApplication: (application: TutorApplication) => void;
  setSelectedApplication: (application: TutorApplication | null) => void;
  rankedApplications: TutorApplication[];
  setRankedApplications: (applications: TutorApplication[]) => void;
}

export const useApplicationActions = ({
  selectedApplication,
  comment,
  setComment,
  currentLecturerId,
  loadApplications,
  showToast,
  saveApplication,
  setSelectedApplication,
  rankedApplications,
  setRankedApplications,
}: UseApplicationActionsProps) => {
  const handleSaveComment = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        comment: comment,
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Comment saved!", "success");
    }
  };

  const handleDeleteComment = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        comment: "",
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      setComment("");
      showToast("Comment deleted!", "success");
    }
  };

  const handleSelectApplicantButton = (selectedCourses: string[]) => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        selected: true,
        selectedBy: currentLecturerId,
        selectedDate: getMelbourneDateOnly(),
        selectedForCourses: selectedCourses,
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Applicant selected!", "success");
    }
  };

  const handleUnselectApplicant = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        selected: false,
        selectedBy: undefined,
        selectedDate: undefined,
        selectedForCourses: undefined,
        rank: undefined,
      };
      saveApplication(updatedApplication);

      if (selectedApplication.rank !== undefined) {
        const newRankedApplications = rankedApplications
          .filter(
            (app) =>
              app.id !== selectedApplication.id &&
              app.userId !== selectedApplication.userId
          )
          .map((app, index) => ({ ...app, rank: index + 1 }));

        newRankedApplications.forEach((app) => {
          saveApplication(app);
        });

        setRankedApplications(newRankedApplications);
      }

      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Applicant unselected and removed from ranking!", "success");
    }
  };

  const handleAddToRanking = () => {
    if (selectedApplication && !selectedApplication.rank) {
      const maxRank = rankedApplications.reduce(
        (max, app) => Math.max(max, app.rank || 0),
        0
      );
      const updatedApplication = {
        ...selectedApplication,
        rank: maxRank + 1,
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Applicant added to ranking!", "success");
    }
  };

  const handleMoveUp = (application: TutorApplication) => {
    const currentIndex = rankedApplications.findIndex(
      (app) => app.id === application.id || app.userId === application.userId
    );
    if (currentIndex > 0) {
      const newRankedApplications = [...rankedApplications];
      [
        newRankedApplications[currentIndex],
        newRankedApplications[currentIndex - 1],
      ] = [
          newRankedApplications[currentIndex - 1],
          newRankedApplications[currentIndex],
        ];

      newRankedApplications.forEach((app, index) => {
        const updatedApp = { ...app, rank: index + 1 };
        saveApplication(updatedApp);
      });

      setRankedApplications(newRankedApplications);
      loadApplications();
      showToast("Applicant moved up in ranking!", "success");
    }
  };

  const handleMoveDown = (application: TutorApplication) => {
    const currentIndex = rankedApplications.findIndex(
      (app) => app.id === application.id || app.userId === application.userId
    );
    if (currentIndex < rankedApplications.length - 1) {
      const newRankedApplications = [...rankedApplications];
      [
        newRankedApplications[currentIndex],
        newRankedApplications[currentIndex + 1],
      ] = [
          newRankedApplications[currentIndex + 1],
          newRankedApplications[currentIndex],
        ];

      newRankedApplications.forEach((app, index) => {
        const updatedApp = { ...app, rank: index + 1 };
        saveApplication(updatedApp);
      });

      setRankedApplications(newRankedApplications);
      loadApplications();
      showToast("Applicant moved down in ranking!", "success");
    }
  };

  const handleRemoveFromRanking = (applicationId: string) => {
    const appToRemove = rankedApplications.find(
      (app) => app.id === applicationId || app.userId === applicationId
    );
    if (appToRemove) {
      const updatedApplication = { ...appToRemove, rank: undefined };
      saveApplication(updatedApplication);
      const newRankedApplications = rankedApplications
        .filter(
          (app) => app.id !== applicationId && app.userId !== applicationId
        )
        .map((app, index) => ({ ...app, rank: index + 1 }));

      newRankedApplications.forEach((app) => {
        saveApplication(app);
      });

      setRankedApplications(newRankedApplications);
      loadApplications();
      showToast("Applicant removed from ranking!", "success");
    }
  };

  return {
    handleSaveComment,
    handleDeleteComment,
    handleSelectApplicantButton,
    handleUnselectApplicant,
    handleAddToRanking,
    handleMoveUp,
    handleMoveDown,
    handleRemoveFromRanking,
  };
};
