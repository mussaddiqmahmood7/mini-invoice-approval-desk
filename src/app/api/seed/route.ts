import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed-data";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with 6 realistic construction invoices",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed database";
    console.error("API POST /api/seed error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
