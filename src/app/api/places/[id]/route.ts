import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Place } from "@/models/Place";
import {
  getPlacePath,
  getPlaceDeleteStats,
  deletePlaceCascade,
  isValidObjectId,
  normalizePlace,
} from "@/lib/places";
import { Item } from "@/models/Item";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const place = await Place.findById(id).lean();
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const [children, items, path, deleteStats] = await Promise.all([
      Place.find({ parentId: id }).sort({ name: 1 }).lean(),
      Item.find({ placeId: id }).sort({ starred: -1, name: 1 }).lean(),
      getPlacePath(id),
      getPlaceDeleteStats(id),
    ]);

    return NextResponse.json({
      place: normalizePlace(place),
      children: children.map((p) => normalizePlace(p)),
      items,
      path,
      deleteStats: {
        subPlaceCount: deleteStats.subPlaceCount,
        itemCount: deleteStats.itemCount,
        blockedMoveIds: deleteStats.blockedMoveIds,
      },
    });
  } catch (error) {
    console.error("GET /api/places/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch place" },
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
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    if (body.parentId !== undefined) {
      const newParentId = body.parentId || null;

      if (newParentId === id) {
        return NextResponse.json(
          { error: "Cannot move a place into itself" },
          { status: 400 }
        );
      }

      if (newParentId) {
        if (!isValidObjectId(newParentId)) {
          return NextResponse.json(
            { error: "Invalid parent ID" },
            { status: 400 }
          );
        }

        const { getAllDescendantIds } = await import("@/lib/places");
        const descendants = await getAllDescendantIds(id);
        if (descendants.includes(newParentId)) {
          return NextResponse.json(
            { error: "Cannot move a place into its own sub-container" },
            { status: 400 }
          );
        }

        const parent = await Place.findById(newParentId);
        if (!parent) {
          return NextResponse.json(
            { error: "Destination not found" },
            { status: 404 }
          );
        }
      }

      updates.parentId = newParentId;
    }

    const place = await Place.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json(normalizePlace(place));
  } catch (error) {
    console.error("PATCH /api/places/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update place" },
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

    const place = await Place.findById(id);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    await deletePlaceCascade(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/places/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete place" },
      { status: 500 }
    );
  }
}
