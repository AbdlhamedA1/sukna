export interface ApartmentListItem {
  _id: string;
  title: string;
  rentalPrice: number;
  rentalType: 'entire' | 'shared' | 'private_room';
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnishedStatus: 'furnished' | 'semi_furnished' | 'unfurnished';
  images: string[];
  isFeatured?: boolean;
  buildingId: {
    _id: string;
    name: string;
    streetAddress: string;
    googleMapsUrl: string;
  };
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
