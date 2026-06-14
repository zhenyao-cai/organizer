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
    const tag = request.nextUrl.searchParams.get("tag");
    const includePath = request.nextUrl.searchParams.get("includePath") === "true";

    const filter: Record<string, unknown> = {};
    if (placeId) filter.placeId = placeId;
    if (starred === "true") filter.starred = true;
    if (tag) filter.tags = tag;

    const items = await Item.find(filter)
      .sort({ starred: -1, name: 1 })
      .lean();

    if (!includePath) {
      return NextResponse.json(items);
    }

    const itemsWithPath = await Promise.all(
      items.map(async (item) => ({
        ...item,
        path: await getPlacePath(item.placeId.toString()),
      }))
    );

    return NextResponse.json(itemsWithPath);
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
