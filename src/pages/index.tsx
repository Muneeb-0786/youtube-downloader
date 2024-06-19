import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface VideoFormat {
  quality: string;
  format: string;
  itag: number;
}

interface AudioFormat {
  bitrate: number;
  format: string;
  itag: number;
}

interface AuthorInfo {
  name: string;
  channelUrl: string;
  avatar: string | null;
}

interface VideoInfo {
  title: string;
  description: string;
  thumbnail: string;
  duration: string; // or number if it is number of seconds
  views: string; // or number if it is a number
  uploadDate: string;
  author: AuthorInfo;
  video: VideoFormat[];
  audio: AudioFormat[];
  info: any;
}

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchVideoInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/format?videoUrl=${url}`);
      console.log(res.data);
      setVideoInfo(res.data);
      setError(null);
      setLoading(false);
    } catch (error: any) {
      setError(error.response.data.error);
      setVideoInfo(null);
      setLoading(false);
    }
  };

  const downloadFormat = async (format: string) => {
    try {
      window.location.href = `/api/download?videoUrl=${url}&format=video`;
      setError(null);
    } catch (error: any) {
      setError(error.response.data.error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-center items-center w-full">
      <div className="flex flex-col gap-3 h-18 bg-slate-500 w-full px-6 md:px-72 items-center ">
        <input
          type="text"
          className="p-4 w-full text-lg text-white bg-slate-600 border-none focus:outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
        />
        <button
          disabled={loading}
          className="bg-amber-700 w-full p-4 text-white text-lg rounded-md focus:outline-none"
          onClick={fetchVideoInfo}
        >
          {loading ? "Getting..." : "Get Video"}
        </button>
        {error && <p>Error: {error}</p>}
      </div>

      {videoInfo?.info?.map((format: any) => (
        <div key={format.url}>
          <a href={format.url} download target="_blank">
            {format.mimeType.split(";")[0] + " "}
            {format.hasVideo ? format.height + "p" : ""}
          </a>
        </div>
      ))}

      {videoInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2"
        >
          <h2>Video Formats</h2>
          {videoInfo.video?.map((format) => (
            <div
              className="flex flex-col sm:flex-row items-center gap-3 mb-2"
              key={format.itag}
            >
              <p>
                Download Free video {format.quality} - {format.format}
              </p>
              <a
                className="bg-green-400 px-5 py-3 rounded"
                style={{ borderRadius: "10px" }}
                key={format.itag}
                href={`/api/download?videoUrl=${url}&format=video`}
                target="_blank"
                // onClick={() => downloadFormat("video")}
              >
                Download
              </a>
            </div>
          ))}
          <h2>Audio Formats</h2>
          {videoInfo.audio?.map((format) => (
            <div
              className="flex flex-col sm:flex-row items-center gap-3 mb-2"
              key={format.itag}
            >
              <p>
                Download Free video {format.bitrate} - {format.format}
              </p>
              <button
                className="bg-green-400 px-5 py-3 rounded"
                style={{ borderRadius: "10px" }}
                key={format.itag}
                onClick={() => downloadFormat("audio")}
              >
                Download
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {videoInfo && <VideoCard videoInfo={videoInfo} />}
    </main>
  );
}

// components/VideoCard.js

const VideoCard = ({ videoInfo }: { videoInfo: any }) => {
  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  // Animation variants for the buttons
  const buttonVariants = {
    hover: { scale: 1.1, transition: { yoyo: Infinity } },
  };

  return (
    <motion.div
      className="max-w-xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      {/* Video Thumbnail */}
      <img
        src={
          videoInfo?.thumbnail
            ? videoInfo.thumbnail
            : "https://via.placeholder.com/800x450"
        }
        alt="Video Thumbnail"
        className="w-full"
      />

      {/* Video Info */}
      <div className="p-4">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-2">
          {videoInfo.title ? videoInfo.title : "Video Title"}
        </h2>
        {/* Channel Info */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <img
            src={
              videoInfo.author.avatar
                ? videoInfo.author.avatar
                : "https://via.placeholder.com/40"
            }
            alt="Channel Logo"
            className="w-8 h-8 rounded-full mr-2"
          />
          <span>{videoInfo.author.name}</span>
        </div>
        {/* Views and Time */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-2">
            {videoInfo.views?.toLocaleString()} Views
          </span>
          <span>•</span>
          <span>{videoInfo.uploadDate?.toString()}</span>
        </div>
        {/* Description */}
        <p className="text-sm text-gray-700 mb-4">
          {videoInfo.description ? videoInfo.description : "Video Description"}
        </p>
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center sm:justify-start items-center space-x-4">
          {["Like", "Dislike", "Save"].map((action, index) => (
            <motion.button
              key={index}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 mb-2"
              variants={buttonVariants}
              whileHover="hover"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {action === "Like" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 15l7-7 7 7"
                  ></path>
                )}
                {action === "Dislike" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                )}
                {action === "Save" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                )}
              </svg>
              <span>{action}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
