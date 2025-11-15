import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Upload,
  Calendar,
  FileText,
  Edit3,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import MultiSelect from "./ui/MultiSelect";

const OffersDashboard = () => {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null); // { message, type } or null

  const initialForm = {
    discount: "",
    start_time: "",
    end_time: "",
    poster: "",
    posterAlt: "",
    offer_details: "",
    books: [],
  };
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);

  /* ---------- Helpers ---------- */
  const showMessage = (msg, type = "success") => {
    setMessage({ message: msg, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const transformBooksData = (books) => {
    if (!books || !Array.isArray(books)) return [];
    if (books.length > 0 && typeof books[0] === "object") {
      return books.map((b) => b._id || b.id).filter(Boolean);
    }
    return books;
  };

  const formatDateForInput = (dateString) =>
    dateString ? new Date(dateString).toISOString().slice(0, 16) : "";

  const isOfferActive = (offer) => {
    const now = new Date();
    const start = new Date(offer.start_time);
    const end = new Date(offer.end_time);
    return now >= start && now <= end;
  };

  const getSelectedBooksCount = () => formData.books?.length || 0;

  /* ---------- Fetching (combined) ---------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [offersRes, booksRes] = await Promise.all([
        axiosInstance.get("/v1/offer"),
        axiosInstance.get("/books?limit=100"),
      ]);
      if (offersRes?.data?.status || offersRes?.data?.success) {
        setOffers(offersRes.data.data || []);
      } else if (Array.isArray(offersRes?.data)) {
        setOffers(offersRes.data);
      }
      setProducts(booksRes?.data?.data?.books || []);
    } catch (err) {
      console.error("Fetch error:", err);
      showMessage("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ---------- Debugging effects ---------- */
  useEffect(() => {
    console.log("Current formData.books:", formData.books);
  }, [formData.books]);

  useEffect(() => {
    if (editingOffer) {
      console.log("Currently editing offer:", editingOffer);
      console.log("Form data for editing:", formData);
    }
  }, [editingOffer, formData]);

  /* ---------- Validation ---------- */
  const validateForm = () => {
    const errors = {};
    if (!formData.discount || Number(formData.discount) <= 0) {
      errors.discount = "Valid discount is required";
    }
    if (!formData.start_time) errors.start_time = "Start date is required";
    if (!formData.end_time) errors.end_time = "End date is required";
    if (formData.start_time && formData.end_time) {
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        errors.end_time = "End date must be after start date";
      }
    }
    if (!formData.posterAlt?.trim()) errors.posterAlt = "Alt text is required for accessibility";
    if (!formData.offer_details?.trim()) errors.offer_details = "Offer details are required";
    if (!formData.poster && !selectedFile) errors.poster = "Poster image is required";
    if (!formData.books || formData.books.length === 0) errors.books = "At least one book must be selected";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------- Form helpers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (field === "books" && formErrors.books) setFormErrors((p) => ({ ...p, books: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormErrors((p) => ({ ...p, poster: "Please select a valid image file (JPEG, PNG, WebP, GIF)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((p) => ({ ...p, poster: "Image size must be less than 5MB" }));
      return;
    }
    setSelectedFile(file);
    setFormErrors((p) => ({ ...p, poster: "" }));
    const reader = new FileReader();
    reader.onloadend = () => setFormData((p) => ({ ...p, poster: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setFormData((p) => ({ ...p, poster: "" }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedFile(null);
    setFormErrors({});
    setEditingOffer(null);
  };

  const prepareFormData = () => {
    const data = new FormData();
    data.append("discount", formData.discount);
    data.append("start_time", formData.start_time);
    data.append("end_time", formData.end_time);
    data.append("posterAlt", formData.posterAlt);
    data.append("offer_details", formData.offer_details);
    data.append("books", JSON.stringify(formData.books));
    if (selectedFile) data.append("file", selectedFile); // server expects 'file'
    return data;
  };

  /* ---------- CRUD Handlers ---------- */
  const submitOffer = async (url, method = "post") => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = prepareFormData();
      const res =
        method === "post"
          ? await axiosInstance.post(url, payload, { headers: { "Content-Type": "multipart/form-data" } })
          : await axiosInstance.put(url, payload, { headers: { "Content-Type": "multipart/form-data" } });

      console.log("Response:", res.data);
      if (res.data?.status || res.data?.success) {
        fetchAll();
        setShowForm(false);
        resetForm();
        showMessage(method === "post" ? "Offer added successfully!" : "Offer updated successfully!");
      } else {
        showMessage(res.data?.message || "Unexpected server response", "error");
      }
    } catch (err) {
      console.error("Submit error:", err, err.response?.data);
      showMessage(err.response?.data?.message || "Error submitting offer", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    await submitOffer("/v3/offer", "post");
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;
    await submitOffer(`/v3/offer/${editingOffer}`, "put");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/v3/offer/${id}`);
      fetchAll();
      showMessage("Offer deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      showMessage("Error deleting offer", "error");
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer._id || offer.id);
    setFormData({
      discount: offer.discount,
      start_time: formatDateForInput(offer.start_time),
      end_time: formatDateForInput(offer.end_time),
      poster: offer.poster,
      books: transformBooksData(offer.books || offer.boooks),
      posterAlt: offer.posterAlt,
      offer_details: offer.offer_details,
    });
    setSelectedFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- Render ---------- */
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
          } flex items-center space-x-2`}
        >
          {message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{message.message}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Offers Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your special offers and promotions</p>
        </div>
        <button
          onClick={() => {
            setShowForm((s) => {
              if (s) resetForm();
              return !s;
            });
          }}
          className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : showForm ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {showForm ? "Cancel" : "Add Offer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={editingOffer ? handleUpdateOffer : handleAddOffer} className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-100" encType="multipart/form-data">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">{editingOffer ? "Edit Offer" : "Create New Offer"}</h3>
            {editingOffer && (
              <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (flat Off) *</label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:border-transparent ${formErrors.discount ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                  placeholder="Enter discount percentage"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
              </div>
              {formErrors.discount && <p className="text-red-600 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.discount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poster Alt Text *</label>
              <input type="text" name="posterAlt" value={formData.posterAlt} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent ${formErrors.posterAlt ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} placeholder="Describe the poster for accessibility" />
              {formErrors.posterAlt && <p className="text-red-600 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.posterAlt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent ${formErrors.start_time ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
              {formErrors.start_time && <p className="text-red-600 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.start_time}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required min={formData.start_time || new Date().toISOString().slice(0, 16)} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent ${formErrors.end_time ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
              {formErrors.end_time && <p className="text-red-600 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.end_time}</p>}
            </div>
          </div>

          <div>
            <MultiSelect label="Select Books (Multiple) *" options={products.map((book) => ({ value: book._id || book.id, label: book.title, class: book.class }))} selected={formData.books || []} onChange={(selected) => handleInputChange("books", selected)} disabled={loading} />
            {formErrors.books && <p className="text-red-600 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.books}</p>}
            <div className="mt-2 text-sm text-gray-500">Selected books: {getSelectedBooksCount()}{editingOffer && <span className="ml-2 text-blue-600">(Editing mode - previously selected books should be highlighted)</span>}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Details *</label>
            <textarea name="offer_details" rows="4" value={formData.offer_details} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent ${formErrors.offer_details ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} placeholder="Describe the offer details, terms, and conditions..." />
            {formErrors.offer_details && <p className="text-red-600 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.offer_details}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Poster Image *</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 cursor-pointer transition-colors">
                  <Upload size={16} />
                  <span>Choose Image</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-sm text-gray-500">Max 5MB • PNG, JPG, WebP, GIF</span>
              </div>

              {formErrors.poster && <p className="text-red-600 text-sm flex items-center"><AlertCircle size={14} className="mr-1" />{formErrors.poster}</p>}

              {formData.poster && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-2">{selectedFile ? "New Image Preview:" : "Current Image:"}</p>
                  <div className="relative inline-block">
                    <img src={formData.poster} alt="preview" className="w-32 h-32 rounded-lg object-cover border border-gray-300 shadow-sm" />
                    {selectedFile && (
                      <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {selectedFile && <p className="text-sm text-green-600 mt-1">New image selected: {selectedFile.name}</p>}
                </div>
              )}
            </div>
          </div>

          {/* {process.env.NODE_ENV === "development" && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-mono">Debug: Selected Books = {JSON.stringify(formData.books)}</p>
              <p className="text-sm font-mono">Editing: {editingOffer ? `Yes (${editingOffer})` : "No"}</p>
            </div>
          )} */}

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading} className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              {editingOffer ? "Update Offer" : "Create Offer"}
            </button>

            <button type="button" onClick={resetForm} disabled={loading} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Reset
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">All Offers</h3>
          <div className="text-sm text-gray-500">{offers.length} offer{offers.length !== 1 ? "s" : ""} total</div>
        </div>

        {loading && !showForm ? (
          <div className="flex justify-center items-center py-12"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No offers found</p>
            <p className="text-gray-400 mt-2">Create your first offer to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer._id || offer.id} className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${!isOfferActive(offer) ? "opacity-60" : ""}`}>
                <div className="relative">
                  <img src={offer.poster} alt={offer.posterAlt} className="w-full h-48 object-cover" />
                  {!isOfferActive(offer) && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold bg-gray-800 px-3 py-1 rounded-full text-sm">Expired</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">{offer.discount}% OFF</div>
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{offer.offer_details}</h4>
                  <div className="flex items-center text-sm text-gray-500 space-x-2"><Calendar size={14} /><span>{new Date(offer.start_time).toLocaleDateString()} - {new Date(offer.end_time).toLocaleDateString()}</span></div>
                  <div className="text-sm text-gray-600">Books included: {transformBooksData(offer.books || offer.boooks).length}</div>
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => handleEdit(offer)} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"><Edit3 size={14} /><span>Edit</span></button>
                    <button onClick={() => handleDelete(offer._id || offer.id)} className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"><Trash2 size={14} /><span>Delete</span></button>
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

export default OffersDashboard;
