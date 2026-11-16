import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Hash, Phone, Mail, Lock, ShieldCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import PasswordStrength from "../components/PasswordStrength";
import { registerSchema, COMPANY_DOMAIN } from "../utils/validators";
import { popupSuccess } from "../utils/popup";

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const password = watch("password");

  const onSubmit = async (data) => {
    // এখন শুধু নকল অপেক্ষা। পরে এখানে NestJS register API বসবে।
    await new Promise((r) => setTimeout(r, 900));
    console.log("register data:", data);
    await popupSuccess("Registration complete", "You can now log in.");
    navigate("/login");
  };

  return (
    <AuthShell title="Create account" subtitle="Join Manush Tech Lunch & Snacks">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
