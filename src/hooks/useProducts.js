import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/books?limit=100");
      setProducts(response.data?.data?.books || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { products, loading, error, setProducts, fetchBooks, setError };
};

export const useProductForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return { formData, updateField, resetForm, setFormData };
};