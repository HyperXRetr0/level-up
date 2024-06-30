import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./api/user";
import { userReducer } from "./reducer/userReducer";
import { productApi } from "./api/product";
import { cartReducer } from "./reducer/cartReducer";
import { cartApi } from "./api/cart";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [userReducer.name]: userReducer.reducer,
    [cartReducer.name]: cartReducer.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(productApi.middleware)
      .concat(cartApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
