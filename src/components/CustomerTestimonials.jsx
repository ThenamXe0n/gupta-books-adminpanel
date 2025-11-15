import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Star,
  User,
  MessageSquare,
  Calendar,
  Trash2,
  Plus,
  Download,
  Edit,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const TestimonialsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    userName: "",
    message: ""
  });

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("v3/testimonials"); // Your testimonials endpoint
      if (res.data.status) {
        setTestimonials(res.data.data);
      } else {
        console.error("Failed to fetch testimonials");
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📊 Stats Cards
  const stats = [
    {
      title: "Total Testimonials",
      value: testimonials.length,
      change: "+12.5%",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "5 Star Ratings",
      value: testimonials.filter((t) => t.rating === 5).length,
      change: "+8.2%",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Average Rating",
      value: testimonials.length > 0 
        ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1)
        : "0.0",
      change: "+0.3",
      icon: Star,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "This Month",
      value: testimonials.filter((t) => {
        const testimonialDate = new Date(t.createdAt);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return testimonialDate.getMonth() === currentMonth && 
               testimonialDate.getFullYear() === currentYear;
      }).length,
      change: "+15.0%",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
    },
  ];

  // 🔍 Search Filter
  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🌟 Star Rating Display
  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  // ➕ Create Testimonial
  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("v3/testimonials", formData);
      if (res.data.status) {
        setShowForm(false);
        setFormData({ rating: 5, userName: "", message: "" });
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Error creating testimonial:", err);
    }
  };

  // 🗑️ Delete Testimonial
  const handleDeleteTestimonial = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const res = await axiosInstance.delete(`v3/testimonials/${id}`);
        if (res.data.status) {
          fetchTestimonials();
        }
      } catch (err) {
        console.error("Error deleting testimonial:", err);
      }
    }
  };

  // 📤 Export to Excel
  const handleExportToExcel = () => {
    // Similar to your existing export function
    console.log("Export testimonials to Excel");
  };

  if (loading) return <p className="text-center py-8">Loading testimonials...</p>;

  return (
    <div className="space-y-6">
      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
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
                  {/* <span
                    className={`text-xs font-medium ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 💬 Testimonials Section */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-3 lg:space-y-0">
          <h2 className="text-lg font-bold text-gray-900">Customer Testimonials</h2>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* 🔍 Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* ➕ Add Testimonial Button */}
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-105 text-sm"
            >
              <Plus size={14} />
              <span>Add Testimonial</span>
            </button>

            {/* 📥 Export Button */}
            {/* <button
              onClick={handleExportToExcel}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-105 text-sm"
            >
              <Download size={14} />
              <span>Export</span>
            </button> */}
          </div>
        </div>

        {/* ➕ Add Testimonial Form */}
        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Add New Testimonial</h3>
            <form onSubmit={handleCreateTestimonial} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter user name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter testimonial message"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-md transition-all"
                >
                  Create Testimonial
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 📨 Testimonials List */}
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial, index) => (
            <div
              key={testimonial._id || index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="text-white" size={16} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {testimonial.userName}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderStars(testimonial.rating)}
                          <span className="text-sm text-gray-500">
                            {testimonial.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial._id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete testimonial"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      "{testimonial.message}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTestimonials.length === 0 && !loading && (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-600 mb-2">
              No testimonials found
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first testimonial."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsDashboard;