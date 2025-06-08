import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AccountStatusModal.module.css";

interface AccountStatusModalProps {
  isOpen: boolean;
  action: "blocked" | "deleted";
  userName: string;
  onClose?: () => void; // Optional since we'll handle navigation automatically
}

const AccountStatusModal: React.FC<AccountStatusModalProps> = ({
  isOpen,
  action,
  userName,
  onClose,
}) => {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    // Navigate to signin page
    router.push("/signin");
  };

  const title = action === "blocked" ? "Account Blocked" : "Account Deleted";
  const message =
    action === "blocked"
      ? `Your account has been blocked by an administrator. You will need to contact support to resolve this issue.`
      : `Your account has been deleted by an administrator. You will be redirected to the sign-in page.`;

  const icon = action === "blocked" ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.accountStatusBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.accountStatusModal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.accountStatusHeader}>
              <div className={styles.accountStatusHeaderContent}>
                <div className={styles.headerTitleSection}>
                  <h3 className={styles.accountStatusTitle}>{title}</h3>
                  <p className={styles.headerSubtitle}>
                    Account status has changed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.accountStatusClose}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={styles.accountStatusContent}>
              <div className={styles.statusInfoCard}>
                <div className={styles.iconContainer}>
                  <div className={styles.icon}>{icon}</div>
                </div>

                <div className={styles.messageSection}>
                  <p className={styles.userName}>Hello, {userName}</p>
                  <p className={styles.message}>{message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.accountStatusActions}>
                <button
                  className={styles.continueButton}
                  onClick={handleClose}
                  autoFocus
                >
                  Continue to Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountStatusModal;
