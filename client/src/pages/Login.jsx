import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthShell from "../components/AuthShell";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validators";
import { homePathFor } from "../utils/roles";
import { popupQuick } from "../utils/popup";

export default function Login() {
  const { user, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // আগে থেকেই login করা থাকলে সরাসরি নিজের পেজে
  if (user) return <Navigate to={homePathFor(user)} replace />;

  const onSubmit = async (data) => {
    // নকল (demo) login: পরে এখানে NestJS login API বসবে।
    // email "admin" দিয়ে শুরু হলে Admin, নইলে Employee।
    await new Promise((r) => setTimeout(r, 700));
    const name = data.email.split("@")[0];
    const isAdmin = name.toLowerCase().startsWith("admin");
    await popupQuick("Login successful");
    login({
      fullName: name.charAt(0).toUpperCase() + name.slice(1),
      employeeId: isAdmin ? "ADMIN001" : "DEMO-001",
      email: data.email,
      role: isAdmin ? "admin" : "employee",
    });
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
