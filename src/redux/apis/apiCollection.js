import axiosInstance from "../../services/axiosInstance";

export const fetchOrderApi = async () => {
  try {
    const response = await axiosInstance.get("/v3/order");
    return response.data;
  } catch (error) {
    throw new Error(error.response.data);
  }
};
