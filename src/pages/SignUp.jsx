import { User, Mail, Phone, MapPin, Lock, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { useDispatch } from "react-redux";
import { registerUserAsync } from "../redux/auth/authSlice";
import { Eye, EyeOff } from "lucide-react";

const SignupForm = () => {
    const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { register,  handleSubmit, formState: { errors },reset } = useForm();

  const onsubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "profile") {
        if (data.profile && data.profile[0]) {
          formData.append("profile", data.profile[0]); // file
        }
      } else {
        formData.append(key, data[key]); // normal text field
      }
    });


    try {
      await dispatch(registerUserAsync(formData)).unwrap();
       alert("User Registration Succesfull")
       reset()
    } catch (error) {
         alert(error || "Login failed!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2">
      <form
        encType="multipart/form-data"
        onSubmit={handleSubmit(onsubmit)}
        className="shadow-xl border border-gray-200 rounded-2xl p-10 w-full max-w-2xl bg-white"
      >
        {/* Logo + Welcome */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="https://mindcoders.in/assets/img/mindcoderlogo.webp"
            alt="MindCoders Logo"
            className="h-14 border-2 border-blue-900 rounded-lg p-1"
          />
          <h1 className="text-3xl font-bold mt-4 text-gray-800">
            Join Our Test Series
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create your account to access professional test series
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="John Doe"
                className="pl-10 border border-gray-300 rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-black/70 focus:border-2 transition"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="email"
                placeholder="example@email.com"
                {...register("email", { required: "Email is required" })}
                className="pl-10 border border-gray-300 rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-black/70 focus:border-2 transition"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="number"
                {...register("mobile", {
                  required: "Phone number is required",
                })}
                placeholder="9876543210"
                className="pl-10 border border-gray-300 rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-black/70 focus:border-2transition"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Your City"
                {...register("city", { required: "City is required" })}
                className="pl-10 border border-gray-300 rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-black/70 focus:border-2transition"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>




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
              className="absolute right-3 top-4  text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff  size={20} /> : <Eye size={20}/>}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

                {/* Profile Upload */}
          <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="file"
                {...register("profile")}
                className="pl-10 border border-gray-300 rounded-lg p-3 w-full  transition  outline-none focus:ring-2 focus:ring-black/70 focus:border-2"
              />
            </div>
          </div>
        </div>

        {/* Button */}
        <button className="w-full bg-gradient-to-r from-black/90 to-black/70 text-white py-3 rounded-lg hover:opacity-90 transition mt-8 text-lg font-semibold shadow-md">
          Sign Up & Start Test Series
        </button>

        {/* Footer */}
       
        <p className="text-center text-sm  text-gray-700 mt-6">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-black font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
