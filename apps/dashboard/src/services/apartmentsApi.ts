import { apiSlice } from './apiSlice';

export type ListingStatus = 'pending' | 'published' | 'rejected' | 'unpublished';
export type AvailabilityStatus = 'available' | 'rented';

export interface ApartmentAdminItem {
  _id: string;
  title: string;
  description: string;
  rentalPrice: number;
  rentalType: 'entire' | 'shared' | 'private_room';
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnishedStatus: 'furnished' | 'semi_furnished' | 'unfurnished';
  images: string[];
  imagePublicIds: string[];
  ownerName: string;
  ownerPhone: string;
  listingStatus: ListingStatus;
  availabilityStatus: AvailabilityStatus;
  rejectionReason: string;
  buildingId: { _id: string; name: string; streetAddress: string };
  createdAt: string;
}

export interface CreateApartmentBody {
  buildingId: string;
  title: string;
  description: string;
  rentalPrice: number;
  rentalType: ApartmentAdminItem['rentalType'];
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnishedStatus: ApartmentAdminItem['furnishedStatus'];
  images: string[];
  imagePublicIds: string[];
  ownerName: string;
  ownerPhone: string;
}

export const apartmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminApartments: builder.query<ApartmentAdminItem[], ListingStatus | void>({
      query: (status) =>
        status ? `/apartments/admin/all?listingStatus=${status}` : '/apartments/admin/all',
      transformResponse: (res: { data: { apartments: ApartmentAdminItem[] } }) =>
        res.data.apartments,
      providesTags: ['Apartment'],
    }),
    createApartment: builder.mutation<void, CreateApartmentBody>({
      query: (body) => ({ url: '/apartments', method: 'POST', body }),
      invalidatesTags: ['Apartment'],
    }),
    updateApartment: builder.mutation<void, { id: string } & Partial<CreateApartmentBody>>({
      query: ({ id, ...body }) => ({ url: `/apartments/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Apartment'],
    }),
    updateApartmentStatus: builder.mutation<
      void,
      { id: string; listingStatus: ListingStatus; rejectionReason?: string; internalAdminNotes?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/apartments/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Apartment'],
    }),
    updateApartmentAvailability: builder.mutation<
      void,
      { id: string; availabilityStatus: AvailabilityStatus }
    >({
      query: ({ id, ...body }) => ({ url: `/apartments/${id}/availability`, method: 'PATCH', body }),
      invalidatesTags: ['Apartment'],
    }),
    deleteApartment: builder.mutation<void, string>({
      query: (id) => ({ url: `/apartments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Apartment'],
    }),
  }),
});

export const {
  useGetAdminApartmentsQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useUpdateApartmentStatusMutation,
  useUpdateApartmentAvailabilityMutation,
  useDeleteApartmentMutation,
} = apartmentsApi;
