"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, CheckCircle, XCircle, File, X } from "lucide-react";

export default function ProjectSubmissionForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubRepo: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "application/zip" || droppedFile.type === "application/x-zip-compressed")) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a PDF or ZIP file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.title || !formData.description) {
      setError("Title and description are required");
      setIsLoading(false);
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (formData.githubRepo) {
        formDataToSend.append("githubRepo", formData.githubRepo);
      }
      formDataToSend.append("file", file);

      const response = await fetch("/api/student/project", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to submit project");
      }

      setSuccess(true);
      setFormData({ title: "", description: "", githubRepo: "" });
      setFile(null);
      
      setTimeout(() => {
        router.refresh();
        router.push("/student/project");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="toast toast-error"
            >
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-600 hover:text-red-900 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="toast toast-success"
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Project submitted successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label htmlFor="title" className="form-label">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="form-input"
            placeholder="Enter your project title"
          />
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-input"
            placeholder="Describe your project, technologies used, and key features..."
          />
        </div>

        <div>
          <label htmlFor="githubRepo" className="form-label">
            GitHub Repository (Optional)
          </label>
          <input
            type="url"
            id="githubRepo"
            value={formData.githubRepo}
            onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
            className="form-input"
            placeholder="https://github.com/username/project"
          />
        </div>

        <div>
          <label htmlFor="file" className="form-label">
            Project File (PDF or ZIP) <span className="text-red-500">*</span>
          </label>
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            className={`mt-2 flex flex-col items-center justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-indigo-500 bg-indigo-50"
                : file
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              accept=".pdf,.zip"
              required
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-3 text-center">
              {file ? (
                <>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 flex items-center justify-center gap-2">
                      <File className="h-4 w-4" />
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ y: isDragging ? [0, -5, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                  >
                    <Upload className={`mx-auto h-12 w-12 ${isDragging ? "text-indigo-600" : "text-gray-400"}`} />
                  </motion.div>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="font-medium text-indigo-600 hover:text-indigo-700">
                      Click to upload
                    </span>
                    <span className="px-2">or</span>
                    <span className="font-medium text-indigo-600">drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">PDF, ZIP up to 10MB</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || success}
          whileHover={{ scale: isLoading || success ? 1 : 1.02 }}
          whileTap={{ scale: isLoading || success ? 1 : 0.98 }}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Submitted!
            </>
          ) : (
            <>
              <Upload size={20} />
              Submit Project
            </>
          )}
        </motion.button>
      </form>
    </>
  );
}

