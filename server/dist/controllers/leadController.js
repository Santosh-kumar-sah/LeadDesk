"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadById = exports.updateLeadStatus = exports.getLeads = exports.createLead = void 0;
const Lead_1 = require("../models/Lead");
const createLead = async (req, res, next) => {
    try {
        const { name, email, budgetRange, message, companyWebsite } = req.body;
        // Honeypot check: If companyWebsite is populated by a bot, silently return 200 without saving
        if (companyWebsite && companyWebsite.trim().length > 0) {
            res.status(200).json({ message: "Lead submitted successfully" });
            return;
        }
        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        const lead = await Lead_1.Lead.create({
            name,
            email,
            budgetRange,
            message,
            ipAddress,
        });
        res.status(201).json({ id: lead._id });
    }
    catch (error) {
        next(error);
    }
};
exports.createLead = createLead;
const getLeads = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        const search = (req.query.search || "").trim();
        const status = req.query.status || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter = {};
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
            Lead_1.Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Lead_1.Lead.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        res.status(200).json({
            leads,
            total,
            page,
            totalPages,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLeads = getLeads;
const updateLeadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const lead = await Lead_1.Lead.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!lead) {
            res.status(404).json({ error: { message: "Lead not found" } });
            return;
        }
        res.status(200).json(lead);
    }
    catch (error) {
        next(error);
    }
};
exports.updateLeadStatus = updateLeadStatus;
const getLeadById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lead = await Lead_1.Lead.findById(id);
        if (!lead) {
            res.status(404).json({ error: { message: "Lead not found" } });
            return;
        }
        res.status(200).json(lead);
    }
    catch (error) {
        next(error);
    }
};
exports.getLeadById = getLeadById;
