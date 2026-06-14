import { Types } from "mongoose";
import { applyExpirationTag } from "@/lib/expiration";
import { NEED_TO_FIX_TAG } from "@/lib/tags";

export function buildItemsTagFilter(tags: string[]) {
  if (tags.length === 0) return {};

  const now = new Date();
  const orConditions: Record<string, unknown>[] = [];

  for (const tag of tags) {
    if (tag === NEED_TO_FIX_TAG) {
      orConditions.push({ tags: NEED_TO_FIX_TAG });
      orConditions.push({ expiresAt: { $lte: now, $ne: null } });
    } else {
      orConditions.push({ tags: tag });
    }
  }

  return { $or: orConditions };
}

export function itemMatchesAnyTag(
  itemTags: string[],
  selectedTags: string[]
): boolean {
  return selectedTags.some((tag) => itemTags.includes(tag));
}


export type ItemRecord = {
  _id: Types.ObjectId | string;
  name: string;
  description?: string;
  tags?: string[];
  starred?: boolean;
  placeId: Types.ObjectId | string;
  imageUrl?: string | null;
  expiresAt?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function normalizeItem(item: ItemRecord) {
  const expiresAt = item.expiresAt
    ? new Date(item.expiresAt).toISOString()
    : null;

  return {
    _id: item._id.toString(),
    name: item.name,
    description: item.description ?? "",
    tags: applyExpirationTag(item.tags ?? [], expiresAt),
    starred: item.starred ?? false,
    placeId: item.placeId.toString(),
    imageUrl: item.imageUrl ?? null,
    expiresAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
