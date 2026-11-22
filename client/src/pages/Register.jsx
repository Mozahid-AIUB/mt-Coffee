import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Hash, Phone, Mail, Lock, ShieldCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import PasswordStrength from "../components/PasswordStrength";
import { registerSchema, COMPANY_DOMAIN } from "../utils/validators";

import { popupSuccess, popupQuick } from "../utils/popup";
import api from "../api/axios";


export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/register", {
        fullName: data.fullName,
        employeeId: data.employeeId,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });
      await popupSuccess("Registration successful!", "You can now login with your credentials.");
      navigate("/login");
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.message;
      if (status === 429) {
        setError("root", { message: "Too many attempts. Please wait a minute and try again." });
      } else if (status === 409) {
        setError("root", { message: msg || "An account with this email, employee ID, or phone already exists." });
      } else {
        setError("root", { message: msg || "Something went wrong. Please try again." });
      }
    }
  };



  return (
    
    <AuthShell title="Create account" subtitle="Join Manush Tech Lunch & Snacks">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {errors.root.message}
          </p>
        )}
        <FormInput
          label="Full Name"
          icon={User}
          placeholder="Your full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FormInput
          label="Employee ID"
          icon={Hash}
          placeholder="e.g. MT-1024"
          error={errors.employeeId?.message}
          {...register("employeeId")}
        />
        <FormInput
          label="Phone Number"
          type="tel"
          icon={Phone}
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <FormInput
          label="Email"
          type="email"
          icon={Mail}
          placeholder={`you@${COMPANY_DOMAIN}`}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <FormInput
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength value={password} />
        </div>
        <FormInput
          label="Confirm Password"
          type="password"
          icon={ShieldCheck}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button loading={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
