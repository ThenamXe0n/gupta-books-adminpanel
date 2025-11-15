import { useState } from "react";

const MultiSelect = ({ label, options, selected, onChange, disabled }) => {
  const [open, setOpen] = useState(false);

  const toggleSelect = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Selected Tags */}
      <div
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white cursor-pointer flex flex-wrap gap-2 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        {selected.length > 0 ? (
          selected.map((item) => (
            <span
              key={item}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1"
            >
              {options.find((o) => o.value === item)?.label || item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(item);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                ✕
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">Select...</span>
        )}
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-10 mt-2 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleSelect(opt.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opt.label} {opt.class &&<span className="text-blue-600">class : {opt.class} <sup>th</sup></span>}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
