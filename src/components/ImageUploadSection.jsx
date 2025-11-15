import React from "react";
import { Plus, X, BookOpen } from "lucide-react";

const ImageUploadSection = ({
  imagePreviews = [],
  onImageRemove,
  onImageUpload,
  loading,
  maxImages = 7,
  uploadId = "image-upload"
}) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Book Images (Max {maxImages})
      </label>
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          <div className="grid grid-cols-2 gap-4 max-w-48">
            {imagePreviews.map((preview, index) => (
              <ImagePreview
                key={index}
                preview={preview}
                onRemove={() => onImageRemove(index)}
              />
            ))}
            {imagePreviews.length === 0 && <EmptyImageState />}
          </div>
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageUpload(Array.from(e.target.files))}
            className="hidden"
            id={uploadId}
            multiple
            disabled={loading}
          />
          <label
            htmlFor={uploadId}
            className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer text-sm ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <Plus size={16} />
            <span>Upload Images</span>
          </label>
          <p className="text-gray-700 text-xs mt-2">
            Recommended: 400x600px, JPG or PNG, max 7MB per image
            <br />
            Maximum {maxImages} images allowed. {imagePreviews.length}/{maxImages} selected
          </p>
          {imagePreviews.length > 0 && (
            <p className="text-green-600 text-xs mt-1">
              ✓ {imagePreviews.length} image(s) selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ImagePreview = ({ preview, onRemove }) => (
  <div className="relative">
    <div className="w-20 h-28 border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-70">
      <img
        src={preview}
        alt="Preview"
        className="w-full h-full object-cover"
      />
    </div>
    <button
      type="button"
      onClick={onRemove}
      className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
    >
      <X size={12} />
    </button>
  </div>
);

const EmptyImageState = () => (
  <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-70">
    <div className="text-center">
      <BookOpen className="mx-auto text-gray-400 mb-1" size={16} />
      <p className="text-gray-700 text-xs">No images</p>
    </div>
  </div>
);

export default ImageUploadSection;