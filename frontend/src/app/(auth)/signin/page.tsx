import { Suspense } from "react";
import SigninForm from "../../../modules/auth/components/signin-form/signin-form";
import styles from "./signin-page.module.css";

export default function SigninPage() {
  return (
    <div className={styles.pageContainer}>
      <Suspense fallback={<div>Loading...</div>}>
        <SigninForm />
      </Suspense>
    </div>
  );
}
