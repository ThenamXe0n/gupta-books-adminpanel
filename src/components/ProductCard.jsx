import React from "react";
import { BookOpen, Star, Edit, Trash2 } from "lucide-react";

const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-107">
      <div className="relative">
        <img
          src={
            product.images?.[0]?.url ||
            product.image ||
            "https://images.pexels.com/photos/179711/books-bookstore-book-reading-179711.jpeg"
          }
          alt={product.title}
          className="w-full h-32 object-cover"
        />
        {product.images && product.images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            +{product.images.length - 1}
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full p-1">
          <BookOpen size={10} className="text-blue-600" />
        </div>
      </div>

      <div className="p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="inline-block px-2 py-0.7 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-medium rounded-full">
            {product.subject}
          </span>
          <span className="inline-block px-2 py-0.7 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full">
            Class {product.class}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-gray-600 mb-2 text-xs">by {product.author}</p>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Star className="text-yellow-400 fill-current" size={10} />
            <span className="text-gray-600 text-xs ml-1">
              {product.rating || "4.0"}
            </span>
          </div>
          <span className="text-xs text-gray-700">
            {product.stock || 0} left
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-green-600">
            ₹{product.price}
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all text-xs"
          >
            <Edit size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product._id || product.id)}
            className="p-1.7 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;