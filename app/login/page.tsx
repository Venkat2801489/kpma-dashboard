import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <LoginForm
      scope="main"
      title="KPMA Dashboard"
      subtitle="Kissanthan Performance Marketing Agency"
      redirectTo="/dashboard"
    />
  );
}
