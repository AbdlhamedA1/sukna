import { apiSlice } from './apiSlice';
import type { LocationItem } from './locationsApi';

export interface BuildingItem {
  _id: string;
  name: string;
  description: string;
  mainImage: string;
  mainImagePublicId: string;
  additionalImages: string[];
  additionalImagePublicIds: string[];
  governorateId: LocationItem;
  cityId: LocationItem;
  areaId: LocationItem;
  streetAddress: string;
  googleMapsUrl: string;
  isArchived: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBuildingBody {
  name: string;
  description: string;
  mainImage: string;
  mainImagePublicId: string;
  additionalImages: string[];
  additionalImagePublicIds: string[];
  governorateId: string;
  cityId: string;
  areaId: string;
  streetAddress: string;
  googleMapsUrl: string;
}

export const buildingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminBuildings: builder.query<BuildingItem[], void>({
      query: () => '/buildings/admin/all',
      transformResponse: (res: { data: { buildings: BuildingItem[] } }) => res.data.buildings,
      providesTags: ['Building'],
    }),
    createBuilding: builder.mutation<void, CreateBuildingBody>({
      query: (body) => ({ url: '/buildings', method: 'POST', body }),
      invalidatesTags: ['Building'],
    }),
    updateBuilding: builder.mutation<void, { id: string } & Partial<CreateBuildingBody>>({
      query: ({ id, ...body }) => ({ url: `/buildings/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Building'],
    }),
    archiveBuilding: builder.mutation<void, string>({
      query: (id) => ({ url: `/buildings/${id}/archive`, method: 'PATCH' }),
      invalidatesTags: ['Building'],
    }),
    deleteBuilding: builder.mutation<void, string>({
      query: (id) => ({ url: `/buildings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Building'],
    }),
  }),
});

export const {
  useGetAdminBuildingsQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useArchiveBuildingMutation,
  useDeleteBuildingMutation,
} = buildingsApi;
