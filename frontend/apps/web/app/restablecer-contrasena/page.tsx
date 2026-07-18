import { PasswordResetConfirmPage } from "../../src/features/auth/components/password-reset-confirm-page";

export default async function RestablecerContrasenaPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ correo?: string }> }>) {
  const { correo } = await searchParams;
  return <PasswordResetConfirmPage initialEmail={correo} />;
}
