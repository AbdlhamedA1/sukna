import { apiSlice } from './apiSlice';

export interface LocationItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  type: 'governorate' | 'city' | 'area';
  parentId: string | null;
  isActive: boolean;
  displayOrder: number;
}

interface CreateLocationBody {
  nameAr: string;
  nameEn: string;
  type: LocationItem['type'];
  parentId: string | null;
  displayOrder: number;
}

export const locationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminLocations: builder.query<LocationItem[], void>({
      query: () => '/locations/admin/all',
      transformResponse: (res: { data: { locations: LocationItem[] } }) => res.data.locations,
      providesTags: ['Location'],
    }),
    createLocation: builder.mutation<void, CreateLocationBody>({
      query: (body) => ({ url: '/locations', method: 'POST', body }),
      invalidatesTags: ['Location'],
    }),
    updateLocation: builder.mutation<
      void,
      { id: string } & Partial<Pick<LocationItem, 'nameAr' | 'nameEn' | 'displayOrder' | 'isActive'>>
    >({
      query: ({ id, ...body }) => ({ url: `/locations/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Location'],
    }),
  }),
});

export const { useGetAdminLocationsQuery, useCreateLocationMutation, useUpdateLocationMutation } =
  locationsApi;
