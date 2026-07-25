import { z } from "zod";

export const BUDGET_OPTIONS = [
  { value: "<1k", label: "Under ₹50,000" },
  { value: "1k-5k", label: "₹50,000 - ₹2,00,000" },
  { value: "5k-20k", label: "₹2,00,000 - ₹10,00,000" },
  { value: "20k+", label: "₹10,00,000+" },
] as const;

export const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  budgetRange: z.enum(["<1k", "1k-5k", "5k-20k", "20k+"], {
    errorMap: () => ({ message: "Please select a budget range" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
  companyWebsite: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
