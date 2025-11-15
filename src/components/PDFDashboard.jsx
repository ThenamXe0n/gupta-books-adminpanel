import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  Plus,
  Calendar,
  Book,
  Cloud,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import PdfUploadForm from "./form/PdfUploadForm";

const PdfDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v3/pdf");
      if (res.data.status) {
        setPdfs(res.data.data);
      } else {
        console.error("Failed to fetch PDFs");
      }
    } catch (err) {
      console.error("Error fetching PDFs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this PDF? This action cannot be undone."
      )
    ) {
      try {
        const res = await axiosInstance.delete(`/v3/pdf/${id}`);
        if (res.data.status) {
          fetchPdfs();
          alert("PDF deleted successfully!");
        }
      } catch (err) {
        console.error("Error deleting PDF:", err);
        alert("Failed to delete PDF. Please try again.");
      }
    }
  };

  // ✅ Fixed download function
  const handleDownloadPdf = async (url, name = "file.pdf") => {
    try {
      const response = await fetch(url, { method: "GET" });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Unknown date";

  if (loading) return <p className="text-center py-8">Loading PDFs...</p>;

  const stats = [
    {
      title: "Total PDFs",
      value: pdfs.length,
      change: "+5.2%",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "This Month",
      value: pdfs.filter((pdf) => {
        const pdfDate = new Date(pdf.uploadDate || pdf.createdAt);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
          pdfDate.getMonth() === currentMonth &&
          pdfDate.getFullYear() === currentYear
        );
      }).length,
      change: "+12.5%",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "With Book ID",
      value: pdfs.filter((pdf) => pdf.bookId).length,
      change: "+8.1%",
      icon: Book,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Cloud Storage",
      value: "Cloudinary",
      change: "Active",
      icon: Cloud,
      color: "from-orange-500 to-red-500",
    },
  ];

  const filteredPdfs = pdfs.filter(
    (pdf) =>
      pdf.pdfName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pdf.bookId &&
        (typeof pdf.bookId === "object"
          ? pdf.bookId.title
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            pdf.bookId._id?.toLowerCase().includes(searchTerm.toLowerCase())
          : pdf.bookId.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 group hover:scale-105"
            >
              <div
                className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} rounded-bl-2xl opacity-10`}
              ></div>
              <div className="relative">
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-2`}
                >
                  <Icon className="text-white" size={14} />
                </div>
                <h3 className="text-gray-600 text-xs font-medium">
                  {stat.title}
                </h3>
                <div className="flex items-end space-x-2 mt-1">
                  <span className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : stat.change === "Active"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📄 PDF Section */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-3 lg:space-y-0">
          <h2 className="text-lg font-bold text-gray-900">PDF Management</h2>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* 🔍 Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* ➕ Add PDF */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-105 text-sm"
            >
              <Plus size={14} />
              <span>Add PDF</span>
            </button>

            {/* 🧩 Filter */}
            {/* <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-105 text-sm">
              <Filter size={14} />
              <span>Filter</span>
            </button> */}
          </div>
        </div>

        {/* ➕ Add/Edit PDF Form */}
        {showForm && <PdfUploadForm onclose={() => setShowForm(false)} />}

        {/* 📄 PDFs List */}
        <div className="space-y-3">
          {filteredPdfs.map((pdf, i) => (
            <div
              key={pdf._id || i}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="text-white" size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {pdf.pdfName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ID: {pdf._id} • {formatDate(pdf.createdAt)}
                      </p>
                      {pdf.bookId && (
                        <p className="text-xs text-gray-600 mt-1">
                          📘 Book:{" "}
                          {typeof pdf.bookId === "object"
                            ? pdf.bookId.title
                            : `ID: ${pdf.bookId}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* <button
                    onClick={() =>
                      handleDownloadPdf(pdf.pdfUrl, `${pdf.pdfName}.pdf`)
                    }
                    className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all text-sm"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button> */}

                  <button
                    onClick={() => handleDeletePdf(pdf._id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPdfs.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No PDFs found matching your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfDashboard;
