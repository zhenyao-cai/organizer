import { Place, IPlace } from "@/models/Place";
import { Item } from "@/models/Item";
import { Types } from "mongoose";

export interface PlaceWithPath {
  _id: string;
  name: string;
  icon: string;
  parentId: string | null;
  imageUrl: string | null;
  path: {
    _id: string;
    name: string;
    icon: string;
    imageUrl: string | null;
  }[];
}

export function normalizePlace(place: IPlace) {
  return {
    _id: place._id.toString(),
    name: place.name,
    icon: place.icon || (place.parentId ? "Box" : "Home"),
    parentId: place.parentId?.toString() ?? null,
    imageUrl: place.imageUrl ?? null,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };
}

export async function getPlacePath(
  placeId: string
): Promise<
  { _id: string; name: string; icon: string; imageUrl: string | null }[]
> {
  const path: {
    _id: string;
    name: string;
    icon: string;
    imageUrl: string | null;
  }[] = [];
  let currentId: string | null = placeId;

  while (currentId) {
    const place = await Place.findById(currentId).lean<IPlace>();
    if (!place) break;
    path.unshift({
      _id: place._id.toString(),
      name: place.name,
      icon: place.icon || "Box",
      imageUrl: place.imageUrl,
    });
    currentId = place.parentId?.toString() ?? null;
  }

  return path;
}

export async function getAllDescendantIds(placeId: string): Promise<string[]> {
  const ids: string[] = [placeId];
  const queue = [placeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = await Place.find({ parentId: current }).select("_id").lean();
    for (const child of children) {
      const id = child._id.toString();
      ids.push(id);
      queue.push(id);
    }
  }

  return ids;
}

export async function getPlaceDeleteStats(placeId: string) {
  const descendantIds = await getAllDescendantIds(placeId);
  const itemCount = await Item.countDocuments({
    placeId: { $in: descendantIds },
  });
  const subPlaceCount = descendantIds.length - 1;

  return {
    descendantIds,
    blockedMoveIds: descendantIds.filter((d) => d !== placeId),
    subPlaceCount,
    itemCount,
  };
}

export async function deletePlaceCascade(placeId: string) {
  const { descendantIds } = await getPlaceDeleteStats(placeId);
  await Item.deleteMany({ placeId: { $in: descendantIds } });
  await Place.deleteMany({ _id: { $in: descendantIds } });
}

export async function getAllPlacesFlat(): Promise<PlaceWithPath[]> {
  const places = await Place.find().sort({ name: 1 }).lean<IPlace[]>();
  const placeMap = new Map(places.map((p) => [p._id.toString(), p]));

  return places.map((place) => {
    const path: {
      _id: string;
      name: string;
      icon: string;
      imageUrl: string | null;
    }[] = [];
    let currentId: string | null = place._id.toString();
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const p = placeMap.get(currentId);
      if (!p) break;
      path.unshift({
        _id: p._id.toString(),
        name: p.name,
        icon: p.icon || "Box",
        imageUrl: p.imageUrl,
      });
      currentId = p.parentId?.toString() ?? null;
    }

    return {
      _id: place._id.toString(),
      name: place.name,
      icon: place.icon || "Box",
      parentId: place.parentId?.toString() ?? null,
      imageUrl: place.imageUrl,
      path,
    };
  });
}

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}
