import mongoose, { Schema, Document } from "mongoose";

export type BudgetRange = "<1k" | "1k-5k" | "5k-20k" | "20k+";
export type LeadStatus = "New" | "Contacted" | "Closed";

export interface ILead extends Document {
  name: string;
  email: string;
  budgetRange: BudgetRange;
  message: string;
  status: LeadStatus;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    budgetRange: {
      type: String,
      required: true,
      enum: ["<1k", "1k-5k", "5k-20k", "20k+"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      required: true,
      enum: ["New", "Contacted", "Closed"],
      default: "New",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ name: "text", email: "text" });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
