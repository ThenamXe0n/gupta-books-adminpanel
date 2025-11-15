import { useState } from "react";

export const useImageUpload = (initialImages = [], initialPreviews = []) => {
  const [images, setImages] = useState(initialImages);
  const [imagePreviews, setImagePreviews] = useState(initialPreviews);

  const handleImageUpload = (files, onError) => {
    if (files.length === 0) return;

    const totalFiles = images.length + files.length;
    if (totalFiles > 7) {
      onError("Maximum 7 images allowed");
      return;
    }

    for (const file of files) {
      if (file.size > 7 * 1024 * 1024) {
        onError("Image size should be less than 7MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        onError("Please upload only image files");
        return;
      }
    }

    onError("");

    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === files.length) {
          setImages(prev => [...prev, ...files]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return { images, imagePreviews, handleImageUpload, removeImage, setImages, setImagePreviews };
};