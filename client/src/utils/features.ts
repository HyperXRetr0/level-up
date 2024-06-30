import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { MessageResponse } from "../types/api-types";
import { SerializedError } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

type ResponseType =
  | {
      data: MessageResponse;
      error?: undefined;
    }
  | {
      data?: undefined;
      error: FetchBaseQueryError | SerializedError;
    };
export const responseToast = (
  response: ResponseType,
  navigate: NavigateFunction | null,
  url: string
) => {
  if ("data" in response) {
    toast.success(response.data?.message!);
    if (navigate) navigate(url);
  } else {
    const error = response.error as FetchBaseQueryError;
    const errorMessage = error.data as MessageResponse;
    toast.error(errorMessage.message);
  }
};
