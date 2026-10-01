"use client";

import { useRef } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ResumeUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error: string | null;
  onError: (error: string | null) => void;
}

export default function ResumeUpload({
  file,
  onFileSelect,
  error,
  onError,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    onError(null);

    if (!selected) {
      onFileSelect(null);
      return;
    }

    if (selected.type !== "application/pdf") {
      onError("Please upload a PDF file.");
      onFileSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      onError("File size must be under 5MB.");
      onFileSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onFileSelect(selected);
  };

  const handleRemove = () => {
    onFileSelect(null);
    onError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Upload Resume (PDF)
      </label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          error
            ? "border-red-500/50 bg-red-500/5"
            : file
            ? "border-indigo-500/50 bg-indigo-500/5"
            : "border-slate-700 hover:border-slate-500 bg-slate-800/30"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-slate-300 text-sm truncate max-w-xs">
              {file.name}
            </span>
            <span className="text-slate-500 text-xs">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
            <button
              onClick={handleRemove}
              className="text-slate-500 hover:text-red-400 transition-colors ml-2"
              aria-label="Remove file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-slate-400 text-sm mb-1">Drop your resume here or click to browse</p>
            <p className="text-slate-600 text-xs">PDF only, up to 5MB</p>
          </div>
        )}
        {!file && (
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}
        {file && (
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
