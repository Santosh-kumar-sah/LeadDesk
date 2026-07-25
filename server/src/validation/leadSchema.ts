import { z } from "zod";

export const budgetRangeEnum = z.enum(["<1k", "1k-5k", "5k-20k", "20k+"]);
export const leadStatusEnum = z.enum(["New", "Contacted", "Closed"]);

export const createLeadSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  budgetRange: budgetRangeEnum,
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
  companyWebsite: z.string().optional(), // Honeypot field
});

export const updateStatusSchema = z.object({
  status: leadStatusEnum,
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
