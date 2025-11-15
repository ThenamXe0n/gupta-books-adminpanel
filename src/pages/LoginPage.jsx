import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router"; // ✅ ensure it's react-router-dom
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/gph2.png";
import axiosInstance from "../services/axiosInstance";

const LoginForm = ({ setIsAdminLoggedIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("auth/admin/login", data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.status) {
        toast.success("Login Successful ✅");

        // Save token & admin info
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.data.admin));

        // Update login state
        setIsAdminLoggedIn(true);

        // Navigate to dashboard
        navigate("/admin/dashboard/orders");

        reset();
      } else {
        toast.error(res.data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl border border-gray-200 rounded-xl space-y-6 py-4 px-6 w-full max-w-[500px]"
      >
        <div className="flex justify-center">
          <img src={logo} alt="MindCoders Logo" className="h-12 object-cover" />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="block font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-black/70 focus:border-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="block font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-black/70 focus:border-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 mt-3 w-full text-white rounded-md transition-transform duration-150 hover:scale-[0.98] ${
            loading ? "bg-gray-400" : "bg-black/90 hover:bg-black"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
