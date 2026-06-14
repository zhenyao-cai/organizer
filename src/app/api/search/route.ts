import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { Place } from "@/models/Place";
import { getPlacePath, getAllDescendantIds, isValidObjectId } from "@/lib/places";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const q = request.nextUrl.searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ places: [], items: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [places, items] = await Promise.all([
      Place.find({
        $or: [{ name: regex }],
      })
        .limit(20)
        .lean(),
      Item.find({
        $or: [
          { name: regex },
          { description: regex },
          { tags: regex },
        ],
      })
        .limit(30)
        .lean(),
    ]);

    const itemsWithPath = await Promise.all(
      items.map(async (item) => ({
        ...item,
        path: await getPlacePath(item.placeId.toString()),
      }))
    );

    const placesWithPath = await Promise.all(
      places.map(async (place) => ({
        ...place,
        path: await getPlacePath(place._id.toString()),
      }))
    );

    return NextResponse.json({
      places: placesWithPath,
      items: itemsWithPath,
    });
  } catch (error) {
    console.error("GET /api/search:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
