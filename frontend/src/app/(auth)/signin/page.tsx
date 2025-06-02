import SigninForm from "../../../modules/auth/components/signin-form/signin-form";
import styles from "./signin-page.module.css";

export default function SigninPage() {
  return (
    <div className={styles.pageContainer}>
      <SigninForm />
    </div>
  );
}
