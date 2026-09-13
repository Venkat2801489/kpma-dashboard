import { LoginForm } from "@/components/login-form";

export default function WorkerLoginPage() {
  return (
    <LoginForm
      scope="worker"
      title="Worker Payroll"
      subtitle="Separate login — salary data"
      redirectTo="/workers"
    />
  );
}
