export interface Place {
  _id: string;
  name: string;
  icon: string;
  parentId: string | null;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  starred: boolean;
  placeId: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PathSegment {
  _id: string;
  name: string;
  icon: string;
  imageUrl?: string | null;
}

export interface PlaceWithPath extends Place {
  path: PathSegment[];
}

export interface ItemWithPath extends Item {
  path: PathSegment[];
}

