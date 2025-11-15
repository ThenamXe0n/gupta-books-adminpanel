import { useNavigate } from "react-router";
import {
  ShoppingBag,
  Package,
  BarChart3,
  Image,
  Tag,
  LogOut,
  MessageCircle,
  File,
  UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/gph2.png";


const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "orders", label: "Orders", icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
    { id: "products", label: "Products", icon: Package, color: "from-purple-500 to-pink-500" },
    { id: "inquiries", label: "Inquiries", icon: BarChart3, color: "from-green-500 to-emerald-500" },
    { id: "user", label: "Registered User", icon: UserCircle, color: "from-orange-500 to-yellow-500" },
    { id: "banner", label: "Banner", icon: Image, color: "from-orange-500 to-red-500" },
    { id: "offer", label: "Offer", icon: Tag, color: "from-indigo-500 to-blue-500" },
    { id: "testimonials", label: "Testimonials", icon: MessageCircle, color: "from-pink-500 to-rose-500" },
    { id: "pdf", label: "Add Pdf", icon: File, color: "from-indigo-500 to-purpul-500" },
    { id: "reviews", label: "Reviews", icon: MessageCircle, color: "from-emrald-500 to-teal-500" }
  ];

  // 🔐 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logout successful 👋", { duration: 2000 });

    setTimeout(() => {
      navigate("/login", { replace: true });
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl border-r border-gray-200 z-50 hidden lg:flex flex-col justify-between">
      {/* Top Section */}
      <div className="p-6 overflow-y-auto flex-1">
        {/* ✅ GPH Logo */}
        <div className="flex flex-col items-center mb-3">
          <img
            src={logo}
            alt="GPH Logo"
            className="w-15 h-15 object-contain mb-1 drop-shadow-md"
          />
          
        </div>

        {/* Menu */}
        <nav className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                    : "text-gray-600 hover:bg-gray-100 hover:scale-105"
                }`}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 transition-all duration-300 shadow-md"
        >
          <LogOut size={16} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
