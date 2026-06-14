import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { PRESET_TAGS } from "@/lib/tags";

export async function GET() {
  try {
    await connectDB();
    const tags = await Item.distinct("tags");
    const presetIds: string[] = PRESET_TAGS.map((p) => p.id);
    const sorted = (tags as string[])
      .filter(Boolean)
      .sort((a, b) => {
        const aPreset = presetIds.indexOf(a);
        const bPreset = presetIds.indexOf(b);
        if (aPreset !== -1 && bPreset !== -1) return aPreset - bPreset;
        if (aPreset !== -1) return -1;
        if (bPreset !== -1) return 1;
        return a.localeCompare(b);
      });
    return NextResponse.json({ tags: sorted });
  } catch (error) {
    console.error("GET /api/tags:", error);
    return NextResponse.json({ tags: [] });
  }
}
