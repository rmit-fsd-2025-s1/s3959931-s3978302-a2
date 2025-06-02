import SignInForm from "@/modules/auth/components/signin-form/signin-form";
import styles from "./signin-page.module.css";

export default function SignInPage() {
  return (
    <div className={styles.pageContainer}>
      <SignInForm />
    </div>
  );
}
