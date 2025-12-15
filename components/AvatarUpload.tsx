"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";
import { useSession } from "next-auth/react";

interface AvatarUploadProps {
  currentImage?: string | null;
  userName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function AvatarUpload({
  currentImage,
  userName,
  size = "xl",
}: AvatarUploadProps) {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { update } = useSession();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP files are allowed");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setError("");
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setImage(data.imageUrl);
      setPreview(null);
      setSuccess(true);
      
      // Update session to reflect new image
      await update();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="relative">
          <Avatar
            src={preview || image}
            name={userName}
            size={size}
            className="ring-4 ring-slate-200 dark:ring-slate-700"
          />
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center"
              >
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center cursor-pointer"
          onClick={handleClick}
        >
          <Upload className="h-6 w-6 text-white" />
        </motion.div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="mt-4 space-y-2">
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Change Photo"}
        </button>

        {preview && !isUploading && (
          <button
            onClick={handleRemove}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
          >
            Cancel
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            Photo updated successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
