import React, { useState, useEffect } from "react";
import {
  Star,
  Trash2,
  Upload,
  Search,
  MessageSquare,
  Book,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const ReviewDashboard = () => {
  const [Books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    custumerName: "",
    book: "",
    rating: "",
    message: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch all reviews
  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get("/v3/book-reviews");
      if (res.data.status) setReviews(res.data.data);
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };
  const fetchBooks = async () => {
    try {
      // setLoading(true);
      console.log("🔄 Fetching books...");

      const response = await axiosInstance.get("/v1/books?limit=100");
      console.log("📚 Books received:", response.data);

      setBooks(response.data?.data?.books || []);
    } catch (err) {
      console.error("❌ Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, []);

  useEffect(() => {
    fetchReviews();
    fetchBooks();
  }, []);

  // ✅ Handle input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

  // ✅ Submit review (with Cloudinary upload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      // Append each field explicitly
      form.append("custumerName", formData.custumerName);
      form.append("book", formData.book);
      form.append("rating", formData.rating);
      form.append("message", formData.message);
      if (formData.image) {
        form.append("file", formData.image); // backend multer/cloudinary picks this up
      }

      const res = await axiosInstance.post("/v3/book-reviews", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("✅ Review uploaded successfully!");
        setFormData({
          custumerName: "",
          book: "",
          rating: "",
          message: "",
          image: null,
        });
        fetchReviews();
      }
    } catch (error) {
      console.error("Error uploading review:", error);
      alert("❌ Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete review
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axiosInstance.delete(`/v3/book-reviews/${id}`);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review", error);
    }
  };

  // ✅ Filter reviews
  const filteredReviews = reviews.filter(
    (r) =>
      r.custumerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.book?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">
          ⭐ Review Management
        </h1>
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm w-full"
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-red-500" /> Add New Review
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="custumerName"
            value={formData.custumerName}
            onChange={handleChange}
            placeholder="Customer Name"
            required
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-500 outline-none"
          />
          <select
            value={formData.book}
            onChange={handleChange}
            name="book"
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option>Select Book/Product</option>
            {Array.isArray(Books) &&
              Books?.map((book, index) => (
                <option className="text-blue-800" key={index} value={book?._id}>
                  {book?.title} {book?.class + (book?.class > 3 && "TH")}{" "}
                  {book?.subjects?.length > 1
                    ? book?.subjects.join(" | ")
                    : [book?.subject].join(" | ")}
                </option>
              ))}
          </select>

          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            placeholder="Rating (1-5)"
            required
            min="1"
            max="5"
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-500 outline-none"
          />
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Write your review..."
          rows="3"
          className="border rounded-lg p-2 w-full mt-4 focus:ring-2 focus:ring-red-500 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:shadow-md transition-all"
        >
          <Upload size={16} />
          {loading ? "Uploading..." : "Submit Review"}
        </button>
      </form>

      {/* Review Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 bg-white shadow rounded-xl col-span-full">
            <MessageSquare size={36} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              No reviews found. Try adding one!
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col items-center">
                <img
                  src={
                    Array.isArray(rev.image)
                      ? rev.image[0]
                      : rev.image ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="review"
                  className="w-20 h-20 rounded-full object-cover border-4 border-red-100 group-hover:border-red-400 transition-all"
                />
                <h3 className="text-lg font-semibold mt-3 text-gray-800 capitalize">
                  {rev.custumerName}
                </h3>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Book size={12} /> {rev?.book?.title || "N/A"}
                </p>

                {/* Rating */}
                <div className="flex justify-center my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < rev.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill={i < rev.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <p className="text-gray-700 text-center text-sm italic mt-2">
                  “{rev.message}”
                </p>

                <button
                  onClick={() => handleDelete(rev._id)}
                  className="mt-4 flex items-center gap-1 text-red-600 hover:text-red-800 text-sm transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewDashboard;
