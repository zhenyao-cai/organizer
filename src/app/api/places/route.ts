import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Place } from "@/models/Place";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const parentId = request.nextUrl.searchParams.get("parentId");

    const filter =
      parentId === "root" || !parentId
        ? { parentId: null }
        : { parentId };

    const places = await Place.find(filter).sort({ name: 1 }).lean();
    const { normalizePlace } = await import("@/lib/places");
    return NextResponse.json(places.map((p) => normalizePlace(p)));
  } catch (error) {
    console.error("GET /api/places:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch places";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, icon, parentId, imageUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const place = await Place.create({
      name: name.trim(),
      icon: icon || (parentId ? "Box" : "Home"),
      parentId: parentId || null,
      imageUrl: imageUrl || null,
    });

    const { normalizePlace } = await import("@/lib/places");
    return NextResponse.json(normalizePlace(place.toObject()), {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/places:", error);
    return NextResponse.json(
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}
