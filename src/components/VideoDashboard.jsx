import  { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Plus,
  Upload,
  Video,
  Calendar,
  Play,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const VideoDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    video: null,
  });

  // Fetch all videos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("v3/videos");
      setVideos(res.data.data || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload new video
  const handleVideoUpload = async (e) => {
    e.preventDefault();

    if (!videoForm.video) return alert("Please upload a video");

    try {
      const formData = new FormData();
      formData.append("title", videoForm.title);
      formData.append("description", videoForm.description);
      formData.append("video", videoForm.video);

      const res = await axiosInstance.post("v3/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        alert("Video uploaded successfully!");
        setShowVideoForm(false);
        setVideoForm({ title: "", description: "", video: null });
        fetchVideos();
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Video upload failed!");
    }
  };

  // Delete video
  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const res = await axiosInstance.delete(`v3/videos/${id}`);
      if (res.data) fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  const filteredVideos = videos?.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center py-6">Loading videos...</p>;

  return (
    <div className="space-y-6">
      {/* 🎥 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Videos"
          value={videos.length}
          icon={Video}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Uploaded This Month"
          value={
            videos.filter((v) => {
              const d = new Date(v.createdAt);
              return (
                d.getMonth() === new Date().getMonth() &&
                d.getFullYear() === new Date().getFullYear()
              );
            }).length
          }
          icon={Calendar}
          color="from-blue-500 to-cyan-500"
        />
      </div>

      {/* Header Actions */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-3 lg:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">Video Manager</h2>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowVideoForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition hover:scale-105 text-sm"
            >
              <Plus size={14} />
              <span>Upload Video</span>
            </button>
          </div>
        </div>

        {/* Video Upload Form */}
        {showVideoForm && (
          <div className="mb-6 p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Video size={18} className="text-purple-500" />
              Upload New Video
            </h3>

            <form onSubmit={handleVideoUpload} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter video title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={videoForm.description}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter video description"
                ></textarea>
              </div>

              {/* Upload Box */}
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-400 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, video: e.target.files[0] })
                  }
                  className="hidden"
                />

                <Upload className="text-purple-500 mb-2" size={28} />
                <span className="text-sm text-gray-600">
                  {videoForm.video
                    ? videoForm.video.name
                    : "Click to upload or drag & drop"}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Supported formats: MP4, MOV, MKV
                </span>
              </label>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition"
                >
                  Upload Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Video List */}
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{video.description}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(video.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                  >
                    <Play size={16} />
                  </a>

                  <button
                    onClick={() => handleDeleteVideo(video._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredVideos.length === 0 && (
            <div className="text-center py-6">
              <Video className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No videos found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 📊 Stats Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="relative bg-white rounded-xl shadow-md p-4 overflow-hidden hover:shadow-lg transition hover:scale-105">
    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-10 rounded-bl-2xl`}></div>
    <div className="relative">
      <div className={`w-8 h-8 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="text-white" size={14} />
      </div>
      <h3 className="text-gray-600 text-xs font-medium">{title}</h3>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default VideoDashboard;
