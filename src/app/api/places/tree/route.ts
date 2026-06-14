import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAllPlacesFlat } from "@/lib/places";

export async function GET() {
  try {
    await connectDB();
    const places = await getAllPlacesFlat();
    return NextResponse.json(places);
  } catch (error) {
    console.error("GET /api/places/tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch place tree" },
      { status: 500 }
    );
  }
}
