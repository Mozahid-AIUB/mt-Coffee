import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthShell from "../components/AuthShell";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { loginSchema } from "../utils/validators";
import { popupSuccess } from "../utils/popup";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    // এখন শুধু নকল অপেক্ষা। পরে এখানে NestJS login API বসবে।
    await new Promise((r) => setTimeout(r, 800));
    console.log("login data:", data);
    popupSuccess("Login successful", "Demo only. API is not connected yet.");
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in with your company email">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@manushtech.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormInput
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button loading={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  );
}
