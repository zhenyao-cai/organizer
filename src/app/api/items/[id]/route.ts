import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { Place } from "@/models/Place";
import { getPlacePath, isValidObjectId } from "@/lib/places";
import {
  applyExpirationTag,
  parseExpiresAtInput,
} from "@/lib/expiration";
import { normalizeItem } from "@/lib/items";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const item = await Item.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const path = await getPlacePath(item.placeId.toString());
    return NextResponse.json({
      item: normalizeItem(item),
      path,
    });
  } catch (error) {
    console.error("GET /api/items/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.description !== undefined) updates.description = body.description;
    if (body.starred !== undefined) updates.starred = body.starred;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    if (body.expiresAt !== undefined) {
      updates.expiresAt = parseExpiresAtInput(body.expiresAt);
    }

    if (body.tags !== undefined || body.expiresAt !== undefined) {
      const existing = await Item.findById(id).lean();
      if (!existing) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      const nextExpiresAt =
        body.expiresAt !== undefined
          ? parseExpiresAtInput(body.expiresAt)
          : existing.expiresAt;
      const nextTags =
        body.tags !== undefined ? body.tags : existing.tags ?? [];
      updates.tags = applyExpirationTag(nextTags, nextExpiresAt);
    }

    if (body.placeId !== undefined) {
      if (!isValidObjectId(body.placeId)) {
        return NextResponse.json(
          { error: "Invalid placeId" },
          { status: 400 }
        );
      }
      const place = await Place.findById(body.placeId);
      if (!place) {
        return NextResponse.json(
          { error: "Destination place not found" },
          { status: 404 }
        );
      }
      updates.placeId = body.placeId;
    }

    const item = await Item.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const path = await getPlacePath(item.placeId.toString());
    return NextResponse.json({
      item: normalizeItem(item),
      path,
    });
  } catch (error) {
    console.error("PATCH /api/items/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await Item.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/items/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
