import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { Cloud, Upload } from "lucide-react";
import toast from "react-hot-toast";

const PdfUploadForm = ({ onclose }) => {
  const [books, setBooks] = useState([]);

  const [booksLoading, setBooksLoading] = useState(true);

  const [editingPdf, setEditingPdf] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    pdfName: "",
    bookId: "",
    pdf: null,
  });

  // Fetch PDFs & Books
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setBooksLoading(true);
      const res = await axiosInstance.get("/books");
      const existingpdf = await axiosInstance.get("/v1/all-pdf");

      let existingPdfArray = existingpdf.data.data.map(
        (pdf) => pdf?.bookId?._id
      );
      console.log(existingPdfArray);

      let booksArray = [];

      // Try different possible response structures
      if (Array.isArray(res.data)) {
        // Response is directly an array
        booksArray = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        // Response has data array
        booksArray = res.data.data;
      } else if (
        res.data &&
        res.data.data &&
        Array.isArray(res.data.data.books)
      ) {
        // Response has data.books array
        booksArray = res.data.data.books;
      } else if (
        res.data &&
        res.data.data &&
        typeof res.data.data === "object"
      ) {
        // Response data is an object - convert to array
        booksArray = Object.values(res.data.data);
      } else if (res.data && Array.isArray(res.data.books)) {
        // Response has books array
        booksArray = res.data.books;
      }

      console.log("Extracted books array:", booksArray);
      let filteredbooks = booksArray.filter(
        (book) => !existingPdfArray.includes(book._id)
      );
      setBooks(filteredbooks);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  };

  // ➕ Create PDF
  const handleCreatePdf = async (e) => {
    e.preventDefault();
    if (!formData.pdf) {
      toast.error("Please select a PDF file");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formDataToSend = new FormData();
      formDataToSend.append("pdfName", formData.pdfName);
      if (formData.bookId) {
        formDataToSend.append("bookId", formData.bookId);
      }
      formDataToSend.append("file", formData.pdf);

      const res = await axiosInstance.post("/v3/pdf", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      if (res.data.status) {
        setFormData({ pdfName: "", bookId: "", pdf: null });
        setUploadProgress(0);
        setUploading(false);

        // Force refresh the PDF list

        toast.success("PDF uploaded successfully!");
        onclose();
      }
    } catch (err) {
      console.error("Error creating PDF:", err);
      // toast.error("Failed to upload PDF. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 📁 File Input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, pdf: file });
    }
  };

  // Helpers
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">{"Add New PDF"}</h3>
      <form onSubmit={handleCreatePdf} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Name *
            </label>
            <input
              type="text"
              required
              value={formData.pdfName}
              onChange={(e) =>
                setFormData({ ...formData, pdfName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter PDF name"
            />
          </div>

          {/* 📚 Book Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Book (optional)
            </label>
            <select
              value={formData.bookId}
              onChange={(e) =>
                setFormData({ ...formData, bookId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={booksLoading}
            >
              <option value="">-- Select Book --</option>
              {booksLoading ? (
                <option value="" disabled>
                  Loading books...
                </option>
              ) : books.length > 0 ? (
                books.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.title} - Class {book.class} {book.subject}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No books available
                </option>
              )}
            </select>
          </div>
        </div>

        {/* 📄 PDF File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File "*"
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-md transition-all cursor-pointer text-sm">
                <Upload size={14} />
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <div className="flex-1">
                {formData.pdf ? (
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">{formData.pdf.name}</div>
                    <div className="text-gray-500">
                      {formatFileSize(formData.pdf.size)}
                    </div>
                  </div>
                ) : editingPdf ? (
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">
                      Current: {editingPdf.pdfName}
                    </div>
                    <div className="text-gray-500">
                      Leave empty to keep current file
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-600">No file chosen</span>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Uploading to Cloudinary...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <Cloud size={14} />
          <span>Files are stored securely on Cloudinary</span>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={uploading}
            className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-md transition-all ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Uploading..." : "upload"}
          </button>
          <button
            type="button"
            onClick={() => {
              onclose();
              setEditingPdf(null);
              setFormData({ pdfName: "", bookId: "", pdf: null });
              setUploadProgress(0);
            }}
            disabled={uploading}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PdfUploadForm;
