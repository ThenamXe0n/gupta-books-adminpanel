import React, { useState } from "react";
import { Plus, Search, File, BookOpen, Edit } from "lucide-react";
import axiosInstance from "../services/axiosInstance";

// Hooks
import { useProducts, useProductForm } from "../hooks/useProducts";
import { useImageUpload } from "../hooks/useImageUpload";

// Components
import PdfUploadForm from "./form/PdfUploadForm";
import ProductForm from "./ProductForm";
import ImageUploadSection from "./ImageUploadSection";
import ProductCard from "./ProductCard";

// Constants
import { FORM_CONFIG, DROPDOWN_OPTIONS } from "../constants/productConstants";
import Notiflix, { Loading } from "notiflix";

const ProductsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const { products, loading, error, setProducts, setError } = useProducts();

  const {
    formData: newProduct,
    updateField: updateNewProduct,
    resetForm,
  } = useProductForm(FORM_CONFIG.initialState);
  const {
    formData: editingProduct,
    updateField: updateEditingProduct,
    setFormData: setEditingProduct,
  } = useProductForm(FORM_CONFIG.initialState);

  const {
    images: addImages,
    imagePreviews: addImagePreviews,
    handleImageUpload: handleAddImageUpload,
    removeImage: removeAddImage,
  } = useImageUpload();
  const {
    images: editImages,
    imagePreviews: editImagePreviews,
    handleImageUpload: handleEditImageUpload,
    removeImage: removeEditImage,
    setImages: setEditImages,
    setImagePreviews: setEditImagePreviews,
  } = useImageUpload();

  // Video state for add form
  const [addVideo, setAddVideo] = useState(null);
  const [addVideoPreview, setAddVideoPreview] = useState(null);

  // Video state for edit form
  const [editVideo, setEditVideo] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState(null);

  // Video upload handlers for add form
  const handleAddVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddVideo(file);
      const previewUrl = URL.createObjectURL(file);
      setAddVideoPreview(previewUrl);
    }
  };

  const handleAddVideoRemove = async () => {
    setAddVideo(null);
    setAddVideoPreview(null);
  };

  // Video upload handlers for edit form
  const handleEditVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditVideo(file);
      const previewUrl = URL.createObjectURL(file);
      setEditVideoPreview(previewUrl);
    }
  };

  const handleEditVideoRemove = async () => {
    if (!confirm("are you sure to remove this video from book??")) {
      return;
    } else {
      Notiflix.Loading.pulse();
      await axiosInstance.patch(
        `/books/remove-video-from-book/${editingProduct?._id}`
      );
      setEditVideo(null);
      setEditVideoPreview(null);
      Notiflix.Loading.remove();
    }
  };

  // Form Handlers
  const handleAddProduct = async () => {
    Loading.circle();
    if (!FORM_CONFIG.validateRequiredFields(newProduct)) {
      setError("Please fill in all required fields (*)");
      Loading.remove();
      return;
    }

    try {
      setError("");
      const formData = FORM_CONFIG.createFormData({
        ...newProduct,
        images: addImages,
        video: addVideo, // Include video in form data
      });

      const response = await axiosInstance.post("v3/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProducts((prev) => [response.data.data || response.data, ...prev]);
      setShowAddForm(false);
      resetForm();
      // Reset video state
      setAddVideo(null);
      setAddVideoPreview(null);
      Loading.remove();
    } catch (err) {
      Loading.remove();
      setError(err.response?.data?.message || "Failed to create book.");
    }
  };

  const handleUpdateProduct = async () => {
    Loading.circle();
    if (!FORM_CONFIG.validateRequiredFields(editingProduct)) {
      setError("Please fill in all required fields (*)");
      Loading.remove();
      return;
    }

    try {
      setError("");
      const formData = FORM_CONFIG.createFormData(
        {
          ...editingProduct,
          images: editImages,
          video: editVideo, // Include video in form data
        },
        true
      );

      const response = await axiosInstance.put(
        `/books/${editingProduct._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? response.data.data : p))
      );
      setShowEditForm(false);
      setEditingProduct(FORM_CONFIG.initialState);
      // Reset video state
      setEditVideo(null);
      setEditVideoPreview(null);
      Loading.remove();
    } catch (err) {
      Loading.remove();
      setError(err.response?.data?.message || "Failed to update book.");
    }
  };

  const handleDeleteProduct = async (id) => {
    Loading.circle();
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axiosInstance.delete(`/books/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      Loading.remove();
    } catch (err) {
      Loading.remove();
      setError(err.response?.data?.message || "Failed to delete book.");
    }
  };

  const handleEditProduct = (product) => {
    Loading.circle();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditingProduct({
      ...product,
      images: product.images || [],
      imagePreviews: product.images?.map((img) => img.url) || [],
    });
    setEditImages(product.images || []);
    setEditImagePreviews(product.images?.map((img) => img.url) || []);

    // Set video preview for edit form if video exists
    if (product.video) {
      setEditVideoPreview(product.video.url || product.video);
    }

    setShowEditForm(true);
    Loading.remove();
  };

  const filteredProducts = products.filter((product) =>
    FORM_CONFIG.searchFields.some((field) =>
      product[field]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <Header
        loading={loading}
        onShowPdfForm={() => setShowPdfForm(!showPdfForm)}
        onShowAddForm={() => setShowAddForm(!showAddForm)}
      />

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* Loading State */}
      {loading && <LoadingState />}

      {/* PDF Form */}
      {showPdfForm && <PdfUploadForm onClose={() => setShowPdfForm(false)} />}

      {/* Add Product Form */}
      {showAddForm && (
        <ProductFormModal
          title="Add New Book"
          description="Fill in the details to add a new book to your inventory"
          icon={<Plus className="text-white" size={18} />}
          iconBg="from-green-700 to-emerald-700"
          formData={newProduct}
          onFieldChange={updateNewProduct}
          imagePreviews={addImagePreviews}
          onImageRemove={removeAddImage}
          onImageUpload={(files) => handleAddImageUpload(files, setError)}
          onVideoUpload={handleAddVideoUpload}
          videoPreview={addVideoPreview}
          onVideoRemove={handleAddVideoRemove}
          onCancel={() => {
            setShowAddForm(false);
            // Reset video state on cancel
            setAddVideo(null);
            setAddVideoPreview(null);
          }}
          onSubmit={handleAddProduct}
          loading={loading}
          submitText={loading ? "Adding..." : "Add Book to Inventory"}
          submitBg="from-green-700 to-emerald-700"
          products={products}
          {...DROPDOWN_OPTIONS}
        />
      )}

      {/* Edit Product Form */}
      {showEditForm && editingProduct && (
        <ProductFormModal
          title="Edit Book"
          description="Update the book details"
          icon={<Edit className="text-white" size={18} />}
          iconBg="from-blue-700 to-cyan-700"
          formData={editingProduct}
          onFieldChange={updateEditingProduct}
          imagePreviews={editImagePreviews}
          onImageRemove={removeEditImage}
          onImageUpload={(files) => handleEditImageUpload(files, setError)}
          onVideoUpload={handleEditVideoUpload}
          videoPreview={editVideoPreview}
          onVideoRemove={handleEditVideoRemove}
          onCancel={() => {
            setShowEditForm(false);
            setEditingProduct(FORM_CONFIG.initialState);
            // Reset video state on cancel
            setEditVideo(null);
            setEditVideoPreview(null);
          }}
          onSubmit={handleUpdateProduct}
          loading={loading}
          submitText={loading ? "Updating..." : "Update Book"}
          submitBg="from-blue-700 to-cyan-700"
          products={products}
          {...DROPDOWN_OPTIONS}
        />
      )}

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultsCount={filteredProducts.length}
      />

      {/* Products Grid */}
      <ProductsGrid
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        allProducts={products}
      />
    </div>
  );
};

// Sub-components for better organization
const Header = ({ loading, onShowPdfForm, onShowAddForm }) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Book Management</h2>
      <p className="text-gray-600 mt-1 text-sm">Manage your book inventory</p>
    </div>
    <div className="flex items-center gap-x-4">
      <ActionButton
        icon={<File size={16} />}
        text="Add PDF"
        onClick={onShowPdfForm}
        loading={loading}
        gradient="from-blue-700 to-indigo-700"
      />
      <ActionButton
        icon={<Plus size={16} />}
        text="Add New Book"
        onClick={onShowAddForm}
        loading={loading}
        gradient="from-green-700 to-emerald-700"
      />
    </div>
  </div>
);

const ActionButton = ({ icon, text, onClick, loading, gradient }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${gradient} text-white rounded-xl hover:shadow-lg transition-all hover:scale-107 text-sm disabled:opacity-70 disabled:cursor-not-allowed`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

const ErrorMessage = ({ message }) => (
  <div className="bg-red-70 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
    {message}
  </div>
);

const LoadingState = () => (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
    <p className="text-gray-600 mt-2">Loading...</p>
  </div>
);

const SearchBar = ({ searchTerm, onSearchChange, resultsCount }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search books by title, author, subject, or class..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all text-sm"
        />
      </div>
      <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
        {resultsCount} books found
      </div>
    </div>
  </div>
);

const ProductsGrid = ({ products, onEdit, onDelete, allProducts }) => {
  if (products.length === 0) {
    return allProducts.length === 0 ? (
      <EmptyInventoryState />
    ) : (
      <NoResultsState />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const EmptyInventoryState = () => (
  <div className="text-center py-12">
    <BookOpen size={36} className="mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 mb-2">
      No books in inventory
    </h3>
    <p className="text-gray-700 text-sm">
      Get started by adding your first book to the inventory.
    </p>
  </div>
);

const NoResultsState = () => (
  <div className="text-center py-12">
    <BookOpen size={36} className="mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 mb-2">No books found</h3>
    <p className="text-gray-700 text-sm">
      Try adjusting your search criteria or add new books to your inventory.
    </p>
  </div>
);

// Product Form Modal Component
const ProductFormModal = ({
  title,
  description,
  icon,
  iconBg,
  formData,
  onFieldChange,
  imagePreviews,
  onImageRemove,
  onImageUpload,
  onVideoUpload,
  videoPreview,
  onVideoRemove,
  onCancel,
  onSubmit,
  loading,
  submitText,
  submitBg,
  products,
  ...dropdownOptions
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <div className="flex items-center space-x-3 mb-6">
      <div
        className={`w-10 h-10 bg-gradient-to-r ${iconBg} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>

    <ImageUploadSection
      imagePreviews={imagePreviews}
      onImageRemove={onImageRemove}
      onImageUpload={onImageUpload}
      loading={loading}
      uploadId={title.toLowerCase().replace(" ", "-") + "-upload"}
    />

    <ProductForm
      formData={formData}
      onFieldChange={onFieldChange}
      loading={loading}
      imagePreviews={imagePreviews}
      onImageRemove={onImageRemove}
      onImageUpload={onImageUpload}
      onVideoUpload={onVideoUpload}
      videoPreview={videoPreview}
      onVideoRemove={onVideoRemove}
      products={products}
      {...dropdownOptions}
    />

    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        onClick={onCancel}
        disabled={loading}
        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-sm font-medium disabled:opacity-70"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className={`px-6 py-3 bg-gradient-to-r ${submitBg} text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-70`}
      >
        {submitText}
      </button>
    </div>
  </div>
);

export default ProductsDashboard;
