import { Request, Response, NextFunction } from "express";
import { Lead } from "../models/Lead";
import { CreateLeadInput, UpdateStatusInput } from "../validation/leadSchema";

export const createLead = async (
  req: Request<{}, {}, CreateLeadInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, budgetRange, message, companyWebsite } = req.body;

    // Honeypot check: If companyWebsite is populated by a bot, silently return 200 without saving
    if (companyWebsite && companyWebsite.trim().length > 0) {
      res.status(200).json({ message: "Lead submitted successfully" });
      return;
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

    const lead = await Lead.create({
      name,
      email,
      budgetRange,
      message,
      ipAddress,
    });

    res.status(201).json({ id: lead._id });
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const search = ((req.query.search as string) || "").trim();
    const status = (req.query.status as string) || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (status && ["New", "Contacted", "Closed"].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      leads,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (
  req: Request<{ id: string }, {}, UpdateStatusInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      res.status(404).json({ error: { message: "Lead not found" } });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      res.status(404).json({ error: { message: "Lead not found" } });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
};
