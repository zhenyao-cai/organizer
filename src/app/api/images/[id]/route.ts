import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { fetchImage } from "@/lib/gridfs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await fetchImage(id);

    if (!result) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const webStream = Readable.toWeb(
      result.stream as Readable
    ) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/images/[id]:", error);
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    );
  }
}
