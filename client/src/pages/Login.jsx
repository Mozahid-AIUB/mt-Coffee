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
import api from "../api/axios";


export default function Login() {
  const { user, login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // আগে থেকেই login করা থাকলে সরাসরি নিজের পেজে
  if (user) return <Navigate to={homePathFor(user)} replace />;

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      await popupQuick("Login successful");
      login(res.data.data.user, res.data.data.accessToken);
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.message;
      if (status === 429) {
        setError("root", { message: "Too many attempts. Please wait a minute and try again." });
      } else if (status === 401) {
        setError("root", { message: msg || "Invalid email or password." });
      } else {
        setError("root", { message: msg || "Something went wrong. Please try again." });
      }
    }
  };


  return (
    <AuthShell title="Welcome back" subtitle="Log in with your company email">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {errors.root.message}
          </p>
        )}
        <FormInput
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@manush.tech"
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
