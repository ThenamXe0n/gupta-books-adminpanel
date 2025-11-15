import React, { useState, useEffect } from "react";
import { Upload, Trash2, Image, Plus } from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    ctaText: "Shop Now",
    ctaLink: "/books",
    image: null,
    imagePreview: null,
    isActive: false,
    position: 1,
  });

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v3/banner");
      if (res.data.status) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error("❌ Error fetching banners:", err);
      toast.error(err.response?.data?.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setNewBanner((prev) => ({
        ...prev,
        imagePreview: e.target.result,
      }));
    };
    reader.readAsDataURL(file);

    setNewBanner((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleRemoveImage = () => {
    setNewBanner((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const handleInputChange = (field, value) => {
    setNewBanner((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new banner
  const handleAddBanner = async () => {
    if (!newBanner?.title || !newBanner?.image) {
      toast.error("Title and image are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", newBanner.title);
      formData.append("subtitle", newBanner.subtitle || "");
      formData.append("ctaText", newBanner.ctaText);
      formData.append("ctaLink", newBanner.ctaLink);
      formData.append("isActive", newBanner.isActive);
      formData.append("position", newBanner.position);

      if (newBanner?.image) {
        formData.append("file", newBanner.image);
      }

      await axiosInstance.post("/v3/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchBanners(); // Refresh banner list
      setShowUploadForm(false);
      resetForm();
      toast.success("Banner added successfully!");
    } catch (err) {
      console.error("❌ Error creating banner:", err);
      toast.error(err.response?.data?.message || "Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await axiosInstance.delete(`/v3/banner/${id}`);
      setBanners((prev) => prev.filter((banner) => banner._id !== id));
      toast.success("Banner deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting banner:", err);
      toast.error(err.response?.data?.message || "Failed to delete banner");
    }
  };

  // Toggle banner active status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axiosInstance.patch(`/v3/banner/status/${id}`, {
        isActive: !currentStatus,
      });

      setBanners((prev) =>
        prev.map((banner) =>
          banner._id === id ? { ...banner, isActive: !currentStatus } : banner
        )
      );
      toast.success(
        !currentStatus ? "Banner activated!" : "Banner deactivated!"
      );
    } catch (err) {
      console.error("❌ Error updating banner:", err);
      toast.error(err.response?.data?.message || "Failed to update banner");
    }
  };

  const resetForm = () => {
    setNewBanner({
      title: "",
      subtitle: "",
      ctaText: "Shop Now",
      ctaLink: "/books",
      image: null,
      imagePreview: null,
      isActive: false,
      position: 1,
    });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Banner Management</h2>
          <p className="text-gray-600 mt-1 text-sm">Manage hero section banners</p>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all text-sm"
        >
          <Plus size={16} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Banner</h3>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image *
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                  {newBanner.imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={newBanner.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-gray-500 text-xs">No image</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all cursor-pointer text-sm"
                >
                  <Upload size={16} />
                  <span>Upload Image</span>
                </label>
                <p className="text-gray-500 text-xs mt-2">
                  Recommended: 1920x600px, JPG or PNG, max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Banner Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newBanner.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter banner title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={newBanner.subtitle}
                onChange={(e) =>
                  handleInputChange("subtitle", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter banner subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={newBanner.ctaText}
                onChange={(e) => handleInputChange("ctaText", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Link
              </label>
              <input
                type="text"
                value={newBanner.ctaLink}
                onChange={(e) => handleInputChange("ctaLink", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="/books"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="number"
                value={newBanner.position}
                onChange={(e) =>
                  handleInputChange("position", parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                min="1"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={newBanner.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Active Banner
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowUploadForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBanner}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all text-sm disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Add Banner"}
            </button>
          </div>
        </div>
      )}

      {/* Banners List */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Banners</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8">
            <Image className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No banners found</p>
            <p className="text-gray-500 text-sm mt-1">
              Add your first banner to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="h-32 bg-gray-100 overflow-hidden">
                  <img
                    src={banner?.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {banner.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        banner.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {banner.subtitle}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() =>
                        handleToggleActive(banner._id, banner.isActive)
                      }
                      className={`px-3 py-1 rounded-lg text-xs ${
                        banner.isActive
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {banner.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner._id)}
                      className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
