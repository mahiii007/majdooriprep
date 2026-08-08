import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { User } from "../src/models/User";

// Load local environment configurations
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Error: Please provide a user email. Usage: npm run make-admin <email>");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI is not set. Make sure .env.local is configured.");
    process.exit(1);
  }

  console.log(`Connecting to database...`);
  await mongoose.connect(uri);

  const cleanEmail = email.trim().toLowerCase();
  console.log(`Updating role to 'admin' for user: ${cleanEmail}...`);

  const user = await User.findOneAndUpdate(
    { email: cleanEmail },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    console.error(`Error: User with email "${cleanEmail}" does not exist in the database.`);
  } else {
    console.log(`Success! User "${user.email}" is now an admin (role: "${user.role}").`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
