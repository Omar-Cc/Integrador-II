import { AccountLayoutShell } from "../../src/features/auth/components/account-layout-shell";

export default function OrdersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AccountLayoutShell>{children}</AccountLayoutShell>;
}
