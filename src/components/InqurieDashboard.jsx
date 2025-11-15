import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  User,
  Clock,
  Download,
  MapPin,
  Building2,
  GraduationCap,
  Layers,
  Briefcase,
  XCircle,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const InquiriesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axiosInstance.get("/v3/enquries");
        if (res.data.status) {
          let data = res.data.data;

          data.sort((a, b) => {
            const statusOrder = {
              New: 1,
              "In Progress": 2,
              Replied: 3,
              Resolved: 4,
            };
            const aStatus = statusOrder[a.status] || 5;
            const bStatus = statusOrder[b.status] || 5;
            if (aStatus !== bStatus) return aStatus - bStatus;
            return (
              new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
            );
          });

          setInquiries(data);
        }
      } catch (err) {
        console.error("Error fetching inquiries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
    const interval = setInterval(fetchInquiries, 5 * 60 * 1000);

    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) -
      now;
    const midnightTimer = setTimeout(fetchInquiries, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimer);
    };
  }, []);

  // 📊 Stats
  const stats = [
    {
      title: "Total Inquiries",
      value: inquiries.length,
      change: "+8.2%",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "New Inquiries",
      value: inquiries.filter((i) => i.status === "New").length,
      change: "+12.5%",
      icon: Mail,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "In Progress",
      value: inquiries.filter((i) => i.status === "In Progress").length,
      change: "-3.1%",
      icon: Clock,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Resolved",
      value: inquiries.filter((i) => i.status === "Resolved").length,
      change: "+25.0%",
      icon: User,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Replied":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProfessionBadge = (profession) => {
    switch (profession) {
      case "student":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "teacher":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  // 🔍 Combined Search + Filter
  let filteredData = inquiries;

  filteredData = filteredData.filter(
    (inquiry) =>
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (activeFilter === "sample") {
    filteredData = filteredData.filter((inq) =>
      inq.message?.toLowerCase().includes("sample download")
    );
  } else if (activeFilter === "customer") {
    filteredData = filteredData.filter(
      (inq) => !inq.message?.toLowerCase().includes("sample download")
    );
  }

  const filteredInquiries = filteredData;

  // 📤 Export
  const handleExportToExcel = () => {
    if (filteredInquiries.length === 0) {
      alert("No inquiries to export!");
      return;
    }

    const formattedData = filteredInquiries.map((inq, index) => ({
      SRno: index + 1,
      ...inq,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Inquiries_${new Date().toLocaleDateString()}.xlsx`);
  };

  if (loading) return <p className="text-center py-8">Loading inquiries...</p>;

  return (
    <div className="space-y-6">
      {/* 📊 Stats */}
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
                  <span
                    className={`text-xs font-medium ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
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

      {/* 💬 Inquiries */}
      <div className="bg-white rounded-xl shadow-md p-4">
        {/* Header + Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-3 lg:space-y-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Customer Inquiries</h2>
            <p className="text-sm text-gray-500">
              {activeFilter === "all" && "Showing all inquiries"}
              {activeFilter === "sample" && "Showing sample PDF downloaders"}
              {activeFilter === "customer" && "Showing customer inquiries"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* 🔍 Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-md"
              />
            </div>

            {/* 🧩 Filter Buttons */}
            <button
              onClick={() => setActiveFilter("sample")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                activeFilter === "sample"
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              <Download size={14} />
              <span>Sample Downloaders</span>
            </button>

            <button
              onClick={() => setActiveFilter("customer")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                activeFilter === "customer"
                  ? "bg-emerald-600 text-white shadow-md scale-105"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
            >
              <User size={14} />
              <span>Customer Inquiries</span>
            </button>

            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              <XCircle size={14} />
              <span>All Inquiries</span>
            </button>

            <button
              onClick={handleExportToExcel}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-md transition-all hover:scale-105 text-sm"
            >
              <Download size={14} />
              <span>Download Excel</span>
            </button>
          </div>
        </div>

        {/* 📨 Inquiry Cards */}
        <div className="space-y-3">
          {filteredInquiries.map((inquiry, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-blue-600 text-md">
                      {inquiry.id || inquiry._id}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        inquiry.status
                      )}`}
                    >
                      {inquiry.status || "New"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getProfessionBadge(
                        inquiry.profession
                      )}`}
                    >
                      {inquiry.profession || "N/A"}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User size={12} className="text-gray-500" />
                        <span className="font-medium text-gray-900 text-md capitalize">
                          {inquiry.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Mail size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          {inquiry.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Phone size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          {inquiry.number || "-"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs capitalize">
                          {inquiry.city}, {inquiry.state}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Building2 size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          {inquiry.school || inquiry.coachingName || "-"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Layers size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          Standard: {inquiry.standard || "-"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          Students: {inquiry.noOfStudent || "-"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar size={12} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          {new Date(
                            inquiry.createdAt || inquiry.date
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            inquiry.createdAt || inquiry.date
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 text-md break-words">
                      {inquiry.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredInquiries.length === 0 && !loading && (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-600 mb-2">
              No inquiries found
            </h3>
            <p className="text-gray-500 text-md">
              Try changing your filter or search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiriesDashboard;
