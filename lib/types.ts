export type Language = "en" | "ar";
export type UserRole = "customer" | "owner" | "admin";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type Stay = {
  id: number;
  slug: string;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  city: string;
  cityAr: string;
  area: string;
  areaAr: string;
  price: number;
  rating: number;
  reviews: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  gallery: string[];
  amenities: string[];
  amenitiesAr: string[];
  description: string;
  descriptionAr: string;
  badge: string;
  badgeAr: string;
  instant: boolean;
  latitude: number;
  longitude: number;
};
