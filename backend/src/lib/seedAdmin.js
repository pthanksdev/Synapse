import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

/**
 * Seeds a default Admin user into MongoDB if no admin exists.
 */
export async function seedAdminUser() {
  try {
    const adminEmail = "admin@synapse.com";
    const rawPassword = process.env.ADMIN_SEED_PASSWORD || "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        fullName: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        profilePic: "https://ui-avatars.com/api/?name=System+Admin&background=6366f1&color=fff",
        bio: "Default Synapse Enterprise Administrator",
      });
      console.log("✅ [Seed] Created seed admin user:", adminEmail);
    } else {
      let updated = false;
      if (admin.role !== "admin") {
        admin.role = "admin";
        updated = true;
      }
      if (!admin.password) {
        admin.password = hashedPassword;
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log("✅ [Seed] Updated admin user record:", adminEmail);
      } else {
        console.log("ℹ️ [Seed] Seed admin user ready:", adminEmail);
      }
    }
  } catch (error) {
    console.error("❌ [Seed] Error seeding admin user:", error.message);
  }
}
