import { Suspense } from "react";
import { VerifyEmailPage } from "../../src/features/auth/components/verify-email-page";

export default function Page() {
  return <Suspense fallback={null}><VerifyEmailPage /></Suspense>;
}
