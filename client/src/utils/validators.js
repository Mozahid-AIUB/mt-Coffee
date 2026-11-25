import { z } from "zod";

// কোম্পানির email domain। .env এ VITE_COMPANY_EMAIL_DOMAIN দিয়ে বদলানো যায়।
export const COMPANY_DOMAIN =
  (import.meta.env.VITE_COMPANY_EMAIL_DOMAIN || "manush.tech").toLowerCase();

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const companyEmailField = emailField.refine(
  (v) => v.toLowerCase().endsWith("@" + COMPANY_DOMAIN),
  "Only Manush Tech company email is allowed"
);

export const loginSchema = z.object({
  email: companyEmailField,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .regex(/^[\p{L}\p{M} ]{3,60}$/u, "Full name must be 3 to 60 letters"),
    employeeId: z
      .string()
      .trim()
      .min(1, "Employee ID is required")
      .regex(/^[A-Za-z0-9-]{3,20}$/, "Enter a valid Employee ID"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
    email: companyEmailField,
    password: z
      .string()
      .min(1, "Password is required")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must be 8+ characters with uppercase, lowercase, number and special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
