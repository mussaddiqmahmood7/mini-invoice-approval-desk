import * as dotenv from "dotenv";
dotenv.config();

import { seedDatabase } from "../src/db/seed-data";
import { client } from "../src/db/index";

async function main() {
  console.log("🔨 Sledge: Seeding construction invoices database...");
  const startTime = Date.now();

  try {
    const result = await seedDatabase();
    const duration = Date.now() - startTime;
    console.log(`✅ Database successfully seeded in ${duration}ms!`);
    console.log(`   - Total Invoices: ${result.totalInvoices}`);
    console.log(`   - Processing: ${result.breakdown.processing}`);
    console.log(`   - Needs Review: ${result.breakdown.needsReview} (includes 1 flagged duplicate)`);
    console.log(`   - Approved: ${result.breakdown.approved}`);
    console.log(`   - Rejected: ${result.breakdown.rejected}`);
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
