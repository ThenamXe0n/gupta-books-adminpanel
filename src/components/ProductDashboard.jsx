import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CreditCard as Edit,
  Trash2,
  BookOpen,
  Star,
  Eye,
  X,
  IndianRupee,
  File,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import PdfUploadForm from "./form/PdfUploadForm";
import MultiSelect from "./ui/MultiSelect";
import RichTextEditor from "./ui/RichTextEditor";

const ProductsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newProduct, setNewProduct] = useState({
    title: "",
    author: "",
    price: "",
    MRP: "",
    stock: "",
    description: "",
    subject: "",
    subjects: [],
    class: "",
    isbn: "",
    publisher: "",
    publishYear: "",
    pages: "",
    language: "English",
    category: "book",
    stream: "",
    books: [],
    images: [],
    imagePreviews: [],
  });

  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ Fetch books using axiosInstance
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Fetching books...");

      const response = await axiosInstance.get("/books?limit=100");
      console.log("📚 Books received:", response.data);

      setProducts(response.data?.data?.books || []);
    } catch (err) {
      console.error("❌ Error fetching books:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load books. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ Add new book with multiple images
  const handleAddProduct = async () => {
    if (
      !newProduct.title ||
      !newProduct.author ||
      !newProduct.price ||
      !newProduct.subject ||
      !newProduct.class
    ) {
      setError("Please fill in all required fields (*)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      // Append all product data

      Object.entries(newProduct).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "images" && value.length > 0) {
            // Append multiple image files with field name "images"
            value.forEach((image) => {
              formData.append("images", image);
            });
          } else if (
            ["subjects", "books"].includes(key) &&
            Array.isArray(value)
          ) {
            formData.append(key, JSON.stringify(value)); // ✅ correct
          } else if (key !== "imagePreviews") {
            // Append other fields (except previews)
            formData.append(key, value);
          }
        }
      });

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log("🔄 Creating new book with images...");
      console.log("📁 Images being sent:", newProduct.images);
      console.log("form data ", newProduct);

      const response = await axiosInstance.post("v3/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Book added:", response.data);

      setProducts((prev) => [response.data.data || response.data, ...prev]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("❌ Error creating book:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create book. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update book with multiple images
  const handleUpdateProduct = async () => {
    if (
      !editingProduct.title ||
      !editingProduct.author ||
      !editingProduct.price ||
      !editingProduct.subject ||
      !editingProduct.class
    ) {
      setError("Please fill in all required fields (*)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      // Append all product data
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "images" && value.length > 0) {
            // ✅ FIXED: Safe check for File objects
            const newImages = value.filter(
              (img) =>
                img && typeof img === "object" && "name" in img && "size" in img
            );

            if (newImages.length > 0) {
              newImages.forEach((image) => formData.append("images", image));
            }
          } else if (
            key !== "imagePreviews" &&
            key !== "_id" &&
            key !== "__v" &&
            key !== "createdAt" &&
            key !== "updatedAt"
          ) {
            formData.append(key, value);
          }
        }
      });

      console.log("🔄 Updating book...");
      console.log("📁 Updated data:", editingProduct);

      const response = await axiosInstance.put(
        `/books/${editingProduct._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Book updated:", response.data);

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? response.data.data : p))
      );

      setShowEditForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("❌ Error updating book:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update book. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setNewProduct({
      title: "",
      author: "",
      price: "",
      stock: "",
      description: "",
      subject: "",
      class: "",
      stream: "",
      subjects: "",
      isbn: "",
      publisher: "",
      publishYear: "",
      pages: "",
      language: "English",
      images: [],
      imagePreviews: [],
    });
  };

  // ✅ Delete book using axiosInstance
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting book:", id);
      await axiosInstance.delete(`/books/${id}`);

      setProducts((prev) => prev.filter((p) => p._id !== id));
      console.log("✅ Book deleted successfully");
    } catch (err) {
      console.error("❌ Error deleting book:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete book. Please try again later."
      );
    }
  };

  // ✅ Handle multiple image upload for add form
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check total files count
    const totalFiles = newProduct.images.length + files.length;
    if (totalFiles > 7) {
      setError("Maximum 7 images allowed");
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 7 * 1024 * 1024) {
        setError("Image size should be less than 7MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files");
        return;
      }
    }

    setError("");

    // Create previews for new files
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === files.length) {
          setNewProduct((prev) => ({
            ...prev,
            images: [...prev.images, ...files],
            imagePreviews: [...prev.imagePreviews, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ Handle multiple image upload for edit form
  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check total files count
    const totalFiles = (editingProduct.images?.length || 0) + files.length;
    if (totalFiles > 7) {
      setError("Maximum 7 images allowed");
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 7 * 1024 * 1024) {
        setError("Image size should be less than 7MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files");
        return;
      }
    }

    setError("");

    // Create previews for new files
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === files.length) {
          setEditingProduct((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...files],
            imagePreviews: [...(prev.imagePreviews || []), ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ Remove image from selection in add form
  const removeImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // ✅ Remove image from selection in edit form
  const removeEditImage = (index) => {
    setEditingProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // ✅ Open edit form
  const handleEditProduct = (product) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditingProduct({
      ...product,
      images: product.images || [],
      imagePreviews: product.images?.map((img) => img.url) || [],
    });
    setShowEditForm(true);
  };

  // ✅ Handle input change for add form
  const handleInputChange = (field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Handle input change for edit form
  const handleEditInputChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Available options for dropdowns
  const subjects = [
    "Mathematics",
    "Maths(Basic)",
    "Maths(Standard)",
    "Science",
    "English",
    "Hindi",
    "Social Studies",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "History",
    "Geography",
    "Economics",
    "Business Studies",
    "Accountancy",
    "Physical Education",
    "Art",
    "Music",
    "Sanskrit",
    "Environmental Studies",
    "General Knowledge",
  ];

  const classes = [
    "Nursery",
    "KG",
    "1",
    "2",
    "3",
    "4",
    "7",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "College",
    "Competitive Exams",
  ];

  const streams = ["PCM", "PCB", "commerce"];

  const languages = ["English", "Hindi", "Sanskrit", "Regional Languages"];
  const category = [
    "set",
    "featured",
    "question bank",
    "sample paper",
    "book",
    "all in one",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Book Management</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Manage your book inventory
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            onClick={() => setShowPdfForm(!showPdfForm)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all hover:scale-107 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <File size={16} />
            <span>Add PDF</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-700 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all hover:scale-107 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-70 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      )}

      {/* PDF forms  */}
      {showPdfForm && <PdfUploadForm onclose={() => setShowPdfForm(false)} />}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl flex items-center justify-center">
              <Plus className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Add New Book</h3>
              <p className="text-gray-600 text-sm">
                Fill in the details to add a new book to your inventory
              </p>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Book Images (Max 7)
            </label>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="grid grid-cols-2 gap-4 max-w-48">
                  {newProduct.imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <div className="w-20 h-28 border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-70">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {newProduct.imagePreviews.length === 0 && (
                    <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-70">
                      <div className="text-center">
                        <BookOpen
                          className="mx-auto text-gray-400 mb-1"
                          size={16}
                        />
                        <p className="text-gray-700 text-xs">No images</p>
                      </div>
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
                  id="image-upload"
                  multiple
                  disabled={loading}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer text-sm ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Plus size={16} />
                  <span>Upload Images</span>
                </label>
                <p className="text-gray-700 text-xs mt-2">
                  Recommended: 400x600px, JPG or PNG, max 7MB per image
                  <br />
                  Maximum 7 images allowed. {newProduct.images.length}/7
                  selected
                </p>
                {newProduct.images.length > 0 && (
                  <p className="text-green-600 text-xs mt-1">
                    ✓ {newProduct.images.length} image(s) selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* book category options */}
          <div className="grid grid-cols-2 gap-7 mb-7">
            <div className="my-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newProduct.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                disabled={loading}
              >
                <option>--select category--</option>
                {category.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="my-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream
              </label>
              <select
                value={newProduct.stream}
                onChange={(e) => handleInputChange("stream", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                disabled={loading}
              >
                <option>--select stream--</option>
                {streams.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* If Book Type = Set, Show Books Multiselect */}
            {newProduct.category === "set" && (
              <MultiSelect
                label="Select Books (Multiple)"
                options={products.map((book) => ({
                  value: book._id || book.id,
                  label: book.title,
                  class: book.class,
                }))}
                selected={newProduct.books || []}
                onChange={(selected) => handleInputChange("books", selected)}
                disabled={loading}
              />
            )}

            {/* Subjects Multiselect */}
            {["set", "all in one"].includes(newProduct.category) && (
              <MultiSelect
                label="Subjects (Multiple)"
                options={subjects.map((subject) => ({
                  value: subject,
                  label: subject,
                }))}
                selected={newProduct.subjects || []}
                onChange={(selected) => handleInputChange("subjects", selected)}
                disabled={loading}
              />
            )}
          </div>

          {/* book category options */}

          {/* Basic Information for Add Form */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information <span className="text-red-700">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* Author <span className="text-red-500">*</span> */}
                  Book Title 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter Book title 1 e.g SUPER 100"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* Book Title <span className="text-red-500">*</span> */}
                  Book Title 2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter book title"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-700">*</span>
                </label>
                <select
                  value={newProduct.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  required
                  disabled={loading}
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class/Grade <span className="text-red-700">*</span>
                </label>
                <select
                  value={newProduct.class}
                  onChange={(e) => handleInputChange("class", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  required
                  disabled={loading}
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information for Add Form */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h4>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={newProduct.isbn}
                  onChange={(e) => handleInputChange("isbn", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="978-0-123476-78-9"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  value={newProduct.publisher}
                  onChange={(e) =>
                    handleInputChange("publisher", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="Publisher name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={newProduct.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  disabled={loading}
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
            </div> */}
          </div>

          {/* Product Details for Add Form */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Product Details <span className="text-red-700">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  value={newProduct.MRP}
                  onChange={(e) => handleInputChange("MRP", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Year
                </label>
                <input
                  type="number"
                  value={newProduct.publishYear}
                  onChange={(e) =>
                    handleInputChange("publishYear", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="2024"
                  min="1000"
                  max="2024"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages
                </label>
                <input
                  type="number"
                  value={newProduct.pages}
                  onChange={(e) => handleInputChange("pages", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Description for Add Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={newProduct.description || ""}
              onChange={(value) => handleInputChange("description", value)}
            />
            {/* <textarea
              value={newProduct.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
              placeholder="Enter book description, curriculum details, or key features..."
              rows={4}
              disabled={loading}
            /> */}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowAddForm(false)}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-sm font-medium disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProduct}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-700 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-70"
            >
              {loading ? "Adding..." : "Add Book to Inventory"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Form */}
      {showEditForm && editingProduct && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl flex items-center justify-center">
              <Edit className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Book</h3>
              <p className="text-gray-600 text-sm">Update the book details</p>
            </div>
          </div>

          {/* Image Upload Section for Edit */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Book Images (Max 7)
            </label>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="grid grid-cols-2 gap-4 max-w-48">
                  {editingProduct.imagePreviews?.map((preview, index) => (
                    <div key={index} className="relative">
                      <div className="w-20 h-28 border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-70">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEditImage(index)}
                        className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!editingProduct.imagePreviews ||
                    editingProduct.imagePreviews.length === 0) && (
                    <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-70">
                      <div className="text-center">
                        <BookOpen
                          className="mx-auto text-gray-400 mb-1"
                          size={16}
                        />
                        <p className="text-gray-700 text-xs">No images</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="hidden"
                  id="edit-image-upload"
                  multiple
                  disabled={loading}
                />
                <label
                  htmlFor="edit-image-upload"
                  className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer text-sm ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Plus size={16} />
                  <span>Upload New Images</span>
                </label>
                <p className="text-gray-700 text-xs mt-2">
                  Upload new images to replace existing ones
                  <br />
                  Maximum 7 images allowed. {editingProduct.images?.length || 0}
                  /7 selected
                </p>
              </div>
            </div>
          </div>

          {/* book category options */}
          <div className="grid grid-cols-2 gap-7 mb-7">
            <div className="my-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editingProduct?.category}
                onChange={(e) =>
                  handleEditInputChange("category", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                disabled={loading}
              >
                <option>--select category--</option>
                {category.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="my-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream
              </label>
              <select
                value={editingProduct?.stream}
                onChange={(e) =>
                  handleEditInputChange("stream", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                disabled={loading}
              >
                <option>--select stream--</option>
                {streams.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* If Book Type = Set, Show Books Multiselect */}
            {editingProduct?.category === "set" && (
              <MultiSelect
                label="Select Books (Multiple)"
                options={products.map((book) => ({
                  value: book._id || book.id,
                  label: book.title,
                  class: book.class,
                }))}
                selected={editingProduct?.books || []}
                onChange={(selected) =>
                  handleEditInputChange("books", selected)
                }
                disabled={loading}
              />
            )}

            {/* Subjects Multiselect */}
            {["set", "all in one"].includes(editingProduct?.category) && (
              <MultiSelect
                label="Subjects (Multiple)"
                options={subjects.map((subject) => ({
                  value: subject,
                  label: subject,
                }))}
                selected={editingProduct?.subjects || []}
                onChange={(selected) =>
                  handleEditInputChange("subjects", selected)
                }
                disabled={loading}
              />
            )}
          </div>

          {/* book category options */}

          {/* Edit Form Fields */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information <span className="text-red-700">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* Author <span className="text-red-500">*</span> */}
                  Book Title 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingProduct.author}
                  onChange={(e) =>
                    handleEditInputChange("author", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter Book Title 1 e.g SUPER 100"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) =>
                    handleEditInputChange("title", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter book title"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-700">*</span>
                </label>
                <select
                  value={editingProduct.subject}
                  onChange={(e) =>
                    handleEditInputChange("subject", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  required
                  disabled={loading}
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class/Grade <span className="text-red-700">*</span>
                </label>
                <select
                  value={editingProduct.class}
                  onChange={(e) =>
                    handleEditInputChange("class", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  required
                  disabled={loading}
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional fields for edit form */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={editingProduct.isbn || ""}
                  onChange={(e) =>
                    handleEditInputChange("isbn", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="978-0-123476-78-9"
                  disabled={loading}
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  value={editingProduct.publisher || ""}
                  onChange={(e) =>
                    handleEditInputChange("publisher", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="Publisher name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={editingProduct.language}
                  onChange={(e) =>
                    handleEditInputChange("language", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  disabled={loading}
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  disabled={loading}
                >
                  {category.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Product Details <span className="text-red-700">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    handleEditInputChange("price", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP
                </label>
                <input
                  type="number"
                  value={editingProduct.MRP}
                  onChange={(e) => handleEditInputChange("MRP", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={editingProduct.stock || ""}
                  onChange={(e) =>
                    handleEditInputChange("stock", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Year
                </label>
                <input
                  type="number"
                  value={editingProduct.publishYear || ""}
                  onChange={(e) =>
                    handleEditInputChange("publishYear", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="2024"
                  min="1000"
                  max="2024"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages
                </label>
                <input
                  type="number"
                  value={editingProduct.pages || ""}
                  onChange={(e) =>
                    handleEditInputChange("pages", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={editingProduct?.description || ""}
              onChange={(value) => handleEditInputChange("description", value)}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingProduct(null);
              }}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-sm font-medium disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProduct}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Book"}
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all text-sm"
            />
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            {filteredProducts.length} books found
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-107"
            >
              <div className="relative">
                <img
                  src={
                    product.images?.[0]?.url ||
                    product.image ||
                    "https://images.pexels.com/photos/179711/books-bookstore-book-reading-179711.jpeg"
                  }
                  alt={product.title}
                  className="w-full h-32 object-cover"
                />
                {/* Show image count badge if multiple images */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    +{product.images.length - 1}
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full p-1">
                  <BookOpen size={10} className="text-blue-600" />
                </div>
              </div>

              <div className="p-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="inline-block px-2 py-0.7 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-medium rounded-full">
                    {product.subject}
                  </span>
                  <span className="inline-block px-2 py-0.7 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full">
                    Class {product.class}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-2 text-xs">
                  by {product.author}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Star className="text-yellow-400 fill-current" size={10} />
                    <span className="text-gray-600 text-xs ml-1">
                      {product.rating || "4.0"}
                    </span>
                  </div>
                  {/* <IndianRupee size={10} className="text-gray-600" /> */}
                  <span className="text-xs text-gray-700">
                    {product.stock || 0} left
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-bold text-green-600">
                    ₹{product.price}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {/* <button className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.7 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-lg hover:shadow-md transition-all text-xs">
                    <Eye size={12} />
                    <span>View</span>
                  </button> */}
                  <button
                    onClick={() => {
                      handleEditProduct(product);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all text-xs"
                  >
                    <Edit size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteProduct(product._id || product.id)
                    }
                    className="p-1.7 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-12">
          <BookOpen size={36} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No books found
          </h3>
          <p className="text-gray-700 text-sm">
            Try adjusting your search criteria or add new books to your
            inventory.
          </p>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={36} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No books in inventory
          </h3>
          <p className="text-gray-700 text-sm">
            Get started by adding your first book to the inventory.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsDashboard;
