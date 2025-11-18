// components/VideoReviewSection.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const VideoReviewSection = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRefs = useRef([]);
  

  const videoReviews = [
    {
      id: 1,
      title: "Amazing Product Quality",
      description:
        "See how our product performs in real-world conditions with this detailed review from Sarah.",
      videoUrl:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&h=400&fit=crop",
      duration: "0:30",
    },
    {
      id: 2,
      title: "Unboxing Experience",
      description:
        "John shares his first impressions and unboxing experience with our latest product.",
      videoUrl:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=400&fit=crop",
      duration: "0:25",
    },
    {
      id: 3,
      title: "Long-term Review",
      description:
        "After 3 months of use, Maria shares her long-term experience and durability test.",
      videoUrl:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=300&h=400&fit=crop",
      duration: "0:45",
    },
    {
      id: 4,
      title: "Feature Deep Dive",
      description:
        "Tech expert Mike explores all the advanced features and hidden capabilities.",
      videoUrl:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=300&h=400&fit=crop",
      duration: "0:35",
    },
  ];

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) =>
      prev === videoReviews.length - 1 ? 0 : prev + 1
    );
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
      } else {
        currentVideo.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const goToVideo = (index) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);
  };

  const setVideoRef = (index) => (el) => {
    videoRefs.current[index] = el;
  };

  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      setIsLoading(true);

      const handleLoadedData = () => setIsLoading(false);
      const handleEnded = () => handleVideoEnd();

      currentVideo.addEventListener("loadeddata", handleLoadedData);
      currentVideo.addEventListener("ended", handleEnded);

      if (isPlaying) {
        currentVideo.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }

      return () => {
        currentVideo.removeEventListener("loadeddata", handleLoadedData);
        currentVideo.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentVideoIndex, isPlaying, handleVideoEnd]);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Customer Video Reviews
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch real customers share their experiences with our products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Video Player */}
        <div className="lg:w-2/3">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={setVideoRef(currentVideoIndex)}
              className="w-full h-auto aspect-video"
              muted={isMuted}
              playsInline
              preload="metadata"
            >
              <source
                src={videoReviews[currentVideoIndex].videoUrl}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Mute/Unmute Button */}
                <button
                  onClick={toggleMute}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Video Counter */}
              <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">
                  {currentVideoIndex + 1} / {videoReviews.length}
                </span>
              </div>
            </div>

            {/* Video Info Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 max-w-md">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {videoReviews[currentVideoIndex].title}
                </h3>
                <p className="text-gray-200 text-sm">
                  {videoReviews[currentVideoIndex].description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Thumbnails List */}
        <div className="lg:w-1/3">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {videoReviews.map((review, index) => (
              <div
                key={review.id}
                onClick={() => goToVideo(index)}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  index === currentVideoIndex
                    ? "bg-blue-50 border-2 border-blue-500 shadow-md"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-16 bg-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={review.thumbnail}
                      alt={review.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Play Indicator */}
                  {index === currentVideoIndex && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 rounded px-1">
                    <span className="text-white text-xs">
                      {review.duration}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-semibold text-sm mb-1 ${
                      index === currentVideoIndex
                        ? "text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {review.title}
                  </h4>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {review.description}
                  </p>
                </div>

                {/* Play Button */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentVideoIndex
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Play className="w-3 h-3 ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Dots for Mobile */}
      <div className="flex justify-center gap-2 mt-6 lg:hidden">
        {videoReviews.map((_, index) => (
          <button
            key={index}
            onClick={() => goToVideo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentVideoIndex ? "bg-blue-500 w-6" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default VideoReviewSection;
