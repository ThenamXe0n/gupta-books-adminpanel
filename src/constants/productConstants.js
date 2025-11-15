export const FORM_CONFIG = {
  initialState: {
    title: "",
    author: "",
    price: "",
    MRP: "",
    stock: "",
    description: "",
    subject: "",
    subjects: [],
    class: "",
    isbn: "",
    publisher: "",
    publishYear: "",
    pages: "",
    language: "English",
    category: "book",
    stream: "",
    books: [],
    images: [],
    imagePreviews: [],
    video: null, // ✅ Added video field
    videoPreview: null, // ✅ Added video preview field
  },

  requiredFields: ["title", "author", "price", "subject", "class"],

  searchFields: ["title", "author", "subject", "class"],

  validateRequiredFields: (product) => {
    return FORM_CONFIG.requiredFields.every(field => 
      product[field] && product[field].toString().trim() !== ""
    );
  },

  createFormData: (product, isEdit = false) => {
    const formData = new FormData();

    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        // Handle images upload
        if (key === "images" && value.length > 0) {
          const newImages = value.filter(img => 
            img && typeof img === "object" && "name" in img && "size" in img
          );
          newImages.forEach(image => formData.append("images", image));
        } 
        // ✅ Handle video upload
        else if (key === "video" && value && typeof value === "object" && "name" in value && "size" in value) {
          formData.append("video", value);
        }
        // Handle arrays that need to be stringified
        else if (["subjects", "books"].includes(key) && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } 
        // Handle other fields (exclude preview fields and edit-specific fields)
        else if (key !== "imagePreviews" && key !== "videoPreview" && !isEdit) {
          formData.append(key, value);
        } else if (key !== "imagePreviews" && key !== "videoPreview" && !["_id", "__v", "createdAt", "updatedAt"].includes(key)) {
          formData.append(key, value);
        }
      }
    });

    return formData;
  }
};

export const DROPDOWN_OPTIONS = {
  subjects: [
    "Mathematics", "Maths(Basic)", "Maths(Standard)", "Science", "English", 
    "Hindi", "Social Studies", "Physics", "Chemistry", "Biology", 
    "Computer Science", "History", "Geography", "Economics", 
    "Business Studies", "Accountancy", "Physical Education", "Art", 
    "Music", "Sanskrit", "Environmental Studies", "General Knowledge"
  ],
  classes: [
    "Nursery", "KG", "1", "2", "3", "4", "7", "6", "7", "8", 
    "9", "10", "11", "12", "College", "Competitive Exams"
  ],
  streams: ["PCM", "PCB", "commerce"],
  languages: ["English", "Hindi", "Sanskrit", "Regional Languages"],
  category: ["set", "featured", "question bank", "sample paper", "book", "all in one"]
};