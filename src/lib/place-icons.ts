import {
  Archive,
  Bath,
  Bed,
  Box,
  Briefcase,
  Car,
  ChefHat,
  Folder,
  Home,
  LayoutGrid,
  LucideIcon,
  MapPin,
  Package,
  Shirt,
  Sofa,
  Warehouse,
} from "lucide-react";

export const PLACE_ICONS: Record<string, LucideIcon> = {
  Home,
  ChefHat,
  Sofa,
  Bed,
  Bath,
  Briefcase,
  Car,
  Shirt,
  Archive,
  Box,
  Folder,
  Package,
  LayoutGrid,
  Warehouse,
  MapPin,
};

export const ROOM_PRESETS = [
  { name: "Kitchen", icon: "ChefHat" },
  { name: "Living Room", icon: "Sofa" },
  { name: "Bedroom", icon: "Bed" },
  { name: "Bathroom", icon: "Bath" },
  { name: "Office", icon: "Briefcase" },
  { name: "Garage", icon: "Car" },
  { name: "Closet", icon: "Shirt" },
  { name: "Storage", icon: "Archive" },
];

export const CONTAINER_ICONS = [
  "Box",
  "Folder",
  "Archive",
  "Package",
  "LayoutGrid",
  "Shirt",
  "Warehouse",
];

export function getPlaceIcon(iconName?: string | null): LucideIcon {
  if (iconName && PLACE_ICONS[iconName]) return PLACE_ICONS[iconName];
  return MapPin;
}

export const DEFAULT_ROOT_ICON = "Home";
export const DEFAULT_CONTAINER_ICON = "Box";
