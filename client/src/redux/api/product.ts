import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AllProductResonse,
  CategoryResponse,
  MessageResponse,
  NewProductRequest,
  SearchProductRequest,
  SearchProductResponse,
} from "../../types/api-types";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/v1/product/",
  }),
  endpoints: (builder) => ({
    latestProducts: builder.query<AllProductResonse, string>({
      query: () => "latest",
    }),
    allProducts: builder.query<AllProductResonse, string>({
      query: (id) => `admin-products?id=${id}`,
    }),
    categories: builder.query<CategoryResponse, string>({
      query: () => "categories",
    }),
    searchProducts: builder.query<SearchProductResponse, SearchProductRequest>({
      query: ({ price, sort, page, category, search }) => {
        let baseQuery = `all?page=${page}&search=${search}`;
        if (price) baseQuery += `&price=${price}`;
        if (sort) baseQuery += `&sort=${sort}`;
        if (category) baseQuery += `&category=${category}`;
        return baseQuery;
      },
    }),
    createProducts: builder.mutation<MessageResponse, NewProductRequest>({
      query: ({ formData, id }) => ({
        url: `new?id=${id}`,
        method: "POST",
        body: { formData },
      }),
    }),
  }),
});

export const {
  useLatestProductsQuery,
  useAllProductsQuery,
  useCategoriesQuery,
  useSearchProductsQuery,
  useCreateProductsMutation,
} = productApi;
