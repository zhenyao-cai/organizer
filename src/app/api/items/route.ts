import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { Place } from "@/models/Place";
import { getPlacePath, isValidObjectId } from "@/lib/places";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const placeId = request.nextUrl.searchParams.get("placeId");
    const starred = request.nextUrl.searchParams.get("starred");

    const filter: Record<string, unknown> = {};
    if (placeId) filter.placeId = placeId;
    if (starred === "true") filter.starred = true;

    const items = await Item.find(filter)
      .sort({ starred: -1, name: 1 })
      .lean();

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, tags, starred, placeId, imageUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!placeId || !isValidObjectId(placeId)) {
      return NextResponse.json(
        { error: "Valid placeId is required" },
        { status: 400 }
      );
    }

    const place = await Place.findById(placeId);
    if (!place) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      );
    }

    const item = await Item.create({
      name: name.trim(),
      description: description || "",
      tags: tags || [],
      starred: starred || false,
      placeId,
      imageUrl: imageUrl || null,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/items:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
