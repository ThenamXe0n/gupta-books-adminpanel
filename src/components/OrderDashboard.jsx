import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Package,
  TrendingUp,
  X,
  Settings,
  Truck,
} from "lucide-react";
import { fetchOrderApi } from "../redux/apis/apiCollection";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";

const OrdersDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    minimumordervalue: "",
    shippingcharges: "",
  });
  const [currentShipping, setCurrentShipping] = useState(null);

  const stats = [
    {
      title: "Total Orders",
      value: orderList?.length ?? "undefined",
      change: "",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Free Shipping Above",
      value: currentShipping
        ? `₹${currentShipping.minimumordervalue}`
        : "Not Set",
      change: "",
      icon: Truck,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Shipping Charges",
      value: currentShipping
        ? `₹${currentShipping.shippingcharges}`
        : "Not Set",
      change: "",
      icon: Settings,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orderList.filter((order) => {
    const fullName = order.address?.fullName?.toLowerCase() || "";
    const orderId = order.orderId?.toLowerCase() || "";
    const books = order.items
      ?.map((item) => item?.title?.toLowerCase())
      ?.join(" ");
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      orderId.includes(searchTerm.toLowerCase()) ||
      books.includes(searchTerm.toLowerCase())
    );
  });

  // Fetch shipping charges
  const fetchShippingCharges = async () => {
    try {
      const response = await axiosInstance.get("/v1/shipping-charges");
      const data = response.data;
      if (data.data) {
        setCurrentShipping(data.data);
      }
    } catch (error) {
      console.error("Error fetching shipping charges:", error);
    }
  };

  // Handle shipping form submission
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/v3/shipping-charges",
        shippingData
      );

      const result = response.data;
      console.log("Shipping update response:", result);

      if (result.status) {
        // Refresh shipping data
        await fetchShippingCharges();
        setShowShippingForm(false);
        setShippingData({ minimumordervalue: "", shippingcharges: "" });
        toast.success(result.message);
      } else {
        toast.error("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error updating shipping charges:", error);
      toast.error("Error updating shipping charges");
    }
  };

  useEffect(() => {
    const getAllOrders = async () => {
      const orders = await fetchOrderApi();
      if (orders.status) {
        setOrderList(orders.data);
      }
      console.log("Fetched orders:", orders);
    };
    getAllOrders();
    fetchShippingCharges();
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:scale-105"
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-bl-3xl opacity-10`}
              ></div>
              <div className="relative">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className="text-white" size={18} />
                </div>
                <h3 className="text-gray-600 text-xs font-medium">
                  {stat.title}
                </h3>
                <div className="flex items-end space-x-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  {stat.change && (
                    <span
                      className={`text-xs font-medium ${
                        stat.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      } flex items-center`}
                    >
                      <TrendingUp size={12} className="mr-1" />
                      {stat.change}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Shipping Settings Button Card */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-bl-3xl opacity-10"></div>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-3">
              <Settings className="text-white" size={18} />
            </div>
            <h3 className="text-gray-600 text-xs font-medium">
              Shipping Settings
            </h3>
            <button
              onClick={() => setShowShippingForm(true)}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 text-sm font-medium"
            >
              Configure Shipping
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Charges Form Modal */}
      {showShippingForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowShippingForm(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Shipping Charges
            </h2>

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Value for Free Shipping
                </label>
                <input
                  type="number"
                  value={shippingData.minimumordervalue}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      minimumordervalue: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter minimum order value"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Charges
                </label>
                <input
                  type="number"
                  value={shippingData.shippingcharges}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      shippingcharges: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter shipping charges"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={() => setShowShippingForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>

            {currentShipping && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Current Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Free shipping on orders above:{" "}
                  <strong>₹{currentShipping.minimumordervalue}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Shipping charges:{" "}
                  <strong>₹{currentShipping.shippingcharges}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 text-sm">
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Order ID
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Customer
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Books
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Total
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Payment
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Date
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-blue-600 text-sm">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-3 text-gray-900 text-sm">
                      {order.address?.fullName}
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-sm truncate max-w-[250px]">
                      {order.items?.map((i) => i.title).join(", ")}
                    </td>
                    <td className="py-3 px-3 font-semibold text-green-600 text-sm">
                      ₹{order.totalamount}
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-sm capitalize">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Popup (unchanged) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative animate-fadeIn">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Order Details
            </h2>

            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700">Order Info</h3>
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {selectedOrder.orderId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Customer</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.line1}, {selectedOrder.address?.line2}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.city}, {selectedOrder.address?.state}{" "}
                  {selectedOrder.address?.postalCode}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {selectedOrder.address?.phone}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700">Payment</h3>
              <p className="text-sm text-gray-600 capitalize">
                <strong>Method:</strong> {selectedOrder.paymentMethod}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Payment ID:</strong> {selectedOrder.paymentId}
              </p>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                Ordered Items
              </h3>
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium">Title</th>
                    <th className="py-2 px-3 text-left font-medium">
                      Quantity
                    </th>
                    <th className="py-2 px-3 text-left font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-3 text-gray-800">{item.title}</td>
                      <td className="py-2 px-3 text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-3 text-gray-800">₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-sm">
              <div className="space-y-1 text-right">
                <p className="text-gray-600">
                  Shipping: ₹{selectedOrder.shippingcharge}
                </p>
                <p className="text-gray-900 font-bold text-base">
                  Total: ₹{selectedOrder.totalamount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;
