import SignUpForm from "@/modules/auth/components/signup-form/signup-form";
import styles from "./signup-page.module.css";

export default function SignUpPage() {
  return (
    <div className={styles.pageContainer}>
      <SignUpForm />
    </div>
  );
}
