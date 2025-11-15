import { useState } from "react";
import Sidebar from "../components/Sidebar";
import OrdersDashboard from "../components/OrderDashboard";
import ProductsDashboard from "../components/ProductDashboard";
import InquiriesDashboard from "../components/InqurieDashboard";
import BannerManagement from "../components/BannerDashboard";
import AddOffer from "../components/AddOffer";
import TestimonialsDashboard from "../components/CustomerTestimonials";
import ReviewsDashboard from "../components/BookReviews";
import PDFDashboard from "../components/PDFDashboard";

import "../index.css"; // ✅ Make sure global CSS (with scrollbar-hide class) is imported

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* ✅ Sidebar: fixed, scrollable, and scrollbar hidden */}
      <div className="fixed top-0 left-0 h-screen w-64 overflow-y-auto bg-white shadow-md border-r border-gray-200 z-10 scrollbar-hide">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ✅ Main content area */}
      <div className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            📚 Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Manage bookstore operations</p>
        </div>

        {activeTab === "orders" && <OrdersDashboard />}
        {activeTab === "products" && <ProductsDashboard />}
        {activeTab === "inquiries" && <InquiriesDashboard />}
        {activeTab === "banner" && <BannerManagement />}
        {activeTab === "offer" && <AddOffer />}
        {activeTab === "testimonials" && <TestimonialsDashboard />}
        {activeTab === "reviews" && <ReviewsDashboard />}
        {activeTab === "pdf" && <PDFDashboard />}
        
      </div>
    </div>
  );
};

export default DashboardLayout;
