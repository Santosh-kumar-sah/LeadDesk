import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { AdminUser } from "../models/AdminUser";

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }
    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    const normalizedEmail = adminEmail.trim().toLowerCase();
    const existingAdmin = await AdminUser.findOne({ email: normalizedEmail });

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log(`Admin user updated successfully: ${normalizedEmail}`);
    } else {
      await AdminUser.create({
        email: normalizedEmail,
        passwordHash,
      });
      console.log(`Admin user created successfully: ${normalizedEmail}`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
