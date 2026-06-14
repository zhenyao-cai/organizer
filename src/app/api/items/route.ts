import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { Place } from "@/models/Place";
import { getPlacePath, isValidObjectId } from "@/lib/places";
import { applyExpirationTag, parseExpiresAtInput } from "@/lib/expiration";
import { buildItemsTagFilter, normalizeItem } from "@/lib/items";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const placeId = request.nextUrl.searchParams.get("placeId");
    const starred = request.nextUrl.searchParams.get("starred");
    const tag = request.nextUrl.searchParams.get("tag");
    const tags = request.nextUrl.searchParams.getAll("tag");
    const includePath = request.nextUrl.searchParams.get("includePath") === "true";

    const filter: Record<string, unknown> = {};
    if (placeId) filter.placeId = placeId;
    if (starred === "true") filter.starred = true;
    if (tags.length > 0) {
      Object.assign(filter, buildItemsTagFilter(tags));
    } else if (tag) {
      Object.assign(filter, buildItemsTagFilter([tag]));
    }

    const items = await Item.find(filter)
      .sort({ starred: -1, name: 1 })
      .lean();

    const normalized = items.map((item) => normalizeItem(item));

    if (!includePath) {
      return NextResponse.json(normalized);
    }

    const itemsWithPath = await Promise.all(
      normalized.map(async (item) => ({
        ...item,
        path: await getPlacePath(item.placeId),
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
    const { name, description, tags, starred, placeId, imageUrl, expiresAt } =
      body;

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

    const parsedExpiresAt = parseExpiresAtInput(expiresAt);
    const resolvedTags = applyExpirationTag(tags || [], parsedExpiresAt);

    const item = await Item.create({
      name: name.trim(),
      description: description || "",
      tags: resolvedTags,
      starred: starred || false,
      placeId,
      imageUrl: imageUrl || null,
      expiresAt: parsedExpiresAt,
    });

    return NextResponse.json(normalizeItem(item.toObject()), { status: 201 });
  } catch (error) {
    console.error("POST /api/items:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
