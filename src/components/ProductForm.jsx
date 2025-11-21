import React from "react";
import MultiSelect from "./ui/MultiSelect";
import RichTextEditor from "./ui/RichTextEditor";

const ProductForm = ({
  formData,
  onFieldChange,
  loading,
  imagePreviews = [],
  onImageRemove,
  onImageUpload,
  subjects = [],
  classes = [],
  streams = [],
  languages = [],
  category = [],
  products = [],
  mode = "add", // 'add' or 'edit'
  onVideoUpload, // ✅ New handler for video
  videoPreview, // ✅ Optional video preview state
  onVideoRemove, // ✅ Optional video removal
}) => {
  const isSetCategory = formData.category === "set";
  const isAllInOne = formData.category === "all in one";

  return (
    <div className="space-y-6">
      {/* Category Options */}
      <div className="grid grid-cols-2 gap-7">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFieldChange("category", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
            disabled={loading}
          >
            <option>--select category--</option>
            {category.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <FormField
          label="Slug"
          value={formData.slug}
          onChange={(value) => onFieldChange("slug", value)}
          required
          disabled={loading}
          placeholder="Enter Book slug e.g subject + Class + booktitle"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stream
          </label>
          <select
            value={formData.stream}
            onChange={(e) => onFieldChange("stream", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
            disabled={loading}
          >
            <option>--select stream--</option>
            {streams.map((stream) => (
              <option key={stream} value={stream}>
                {stream}
              </option>
            ))}
          </select>
        </div>

        {isSetCategory && (
          <MultiSelect
            label="Select Books (Multiple)"
            options={products.map((book) => ({
              value: book._id || book.id,
              label: book.title,
              class: book.class,
            }))}
            selected={formData.books || []}
            onChange={(selected) => onFieldChange("books", selected)}
            disabled={loading}
          />
        )}

        {(isSetCategory || isAllInOne) && (
          <MultiSelect
            label="Subjects (Multiple)"
            options={subjects.map((subject) => ({
              value: subject,
              label: subject,
            }))}
            selected={formData.subjects || []}
            onChange={(selected) => onFieldChange("subjects", selected)}
            disabled={loading}
          />
        )}
      </div>

      {/* Basic Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Basic Information <span className="text-red-700">*</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Book Title 1"
            value={formData.author}
            onChange={(value) => onFieldChange("author", value)}
            required
            disabled={loading}
            placeholder="Enter Book title 1 e.g SUPER 100"
          />
          <FormField
            label="Book Title 2"
            value={formData.title}
            onChange={(value) => onFieldChange("title", value)}
            required
            disabled={loading}
            placeholder="Enter book title"
          />

          <SelectField
            label="Subject"
            value={formData.subject}
            onChange={(value) => onFieldChange("subject", value)}
            options={subjects}
            required
            disabled={loading}
          />

          <SelectField
            label="Class/Grade"
            value={formData.class}
            onChange={(value) => onFieldChange("class", value)}
            options={classes}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Product Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Product Details <span className="text-red-700">*</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            label="Price"
            type="number"
            value={formData.price}
            onChange={(value) => onFieldChange("price", value)}
            required
            disabled={loading}
            placeholder="0.00"
            step="0.01"
          />
          <FormField
            label="MRP"
            type="number"
            value={formData.MRP}
            onChange={(value) => onFieldChange("MRP", value)}
            required
            disabled={loading}
            placeholder="0.00"
            step="0.01"
          />
          <FormField
            label="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={(value) => onFieldChange("stock", value)}
            disabled={loading}
            placeholder="0"
          />
          <FormField
            label="Pages"
            type="number"
            value={formData.pages}
            onChange={(value) => onFieldChange("pages", value)}
            disabled={loading}
            placeholder="0"
          />
        </div>
      </div>

      {/* ✅ New Video Upload Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Upload Video (Optional)
        </h4>
        <div className="flex flex-col space-y-3">
          <input
            type="file"
            accept="video/*"
            onChange={onVideoUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-xl cursor-pointer focus:ring-2 focus:ring-blue-700 focus:border-transparent p-2"
          />
          {videoPreview && (
            <div className="mt-2">
              <video
                src={videoPreview}
                controls
                className="w-64 h-40 rounded-lg shadow-md border"
              />
              <button
                type="button"
                onClick={onVideoRemove}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove Video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <RichTextEditor
          value={formData.description || ""}
          onChange={(value) => onFieldChange("description", value)}
        />
      </div>
    </div>
  );
};

// Helper Components
const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  required,
  disabled,
  placeholder,
  step,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-700">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      step={step}
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-700">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm"
      required={required}
      disabled={disabled}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default ProductForm;
