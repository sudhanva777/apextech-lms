"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export default function ProjectSubmissionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubRepo: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

      router.refresh();
      router.push("/student/project");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          placeholder="Enter your project title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          required
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          placeholder="Describe your project, technologies used, and key features..."
        />
      </div>

      <div>
        <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Repository (Optional)
        </label>
        <input
          type="url"
          id="githubRepo"
          value={formData.githubRepo}
          onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          placeholder="https://github.com/username/project"
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
          Project File (PDF or ZIP) <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#4F46E5] transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file"
                className="relative cursor-pointer bg-white rounded-md font-medium text-[#4F46E5] hover:text-[#4338ca] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4F46E5]"
              >
                <span>Upload a file</span>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.zip"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF, ZIP up to 10MB</p>
            {file && (
              <p className="text-sm text-gray-900 font-medium mt-2">{file.name}</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload size={20} />
            Submit Project
          </>
        )}
      </button>
    </form>
  );
}

