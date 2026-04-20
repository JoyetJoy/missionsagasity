import React, { useState, useRef } from "react";
import { Upload, X, File, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";
import { api } from "../../context/api";
import { cn } from "./utils";

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  multiple = false,
  accept = "image/*,application/pdf",
  className,
}) => {
  const [files, setFiles] = useState<{ file: File; progress: number; url?: string; error?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        progress: 0,
      }));
      setFiles(multiple ? [...files, ...newFiles] : newFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      if (multiple) {
        const fileObjects = files.map(f => f.file);
        const result = await api.uploadFiles(fileObjects);
        const urls = result.files.map((f: any) => f.url);
        
        setFiles(files.map((f, i) => ({ ...f, progress: 100, url: urls[i] })));
        onUploadComplete(urls);
      } else {
        const result = await api.uploadFile(files[0].file);
        setFiles([{ ...files[0], progress: 100, url: result.url }]);
        onUploadComplete([result.url]);
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      setFiles(files.map(f => ({ ...f, error: "Upload failed" })));
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        onClick={triggerFileInput}
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          className="hidden"
        />
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="text-blue-600 h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          {multiple ? "Click to upload multiple files" : "Click to upload a file"}
        </p>
        <p className="text-xs text-gray-500 mt-1">Images or PDFs up to 10MB</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((fileData, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm"
            >
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                {fileData.file.type.startsWith("image/") ? (
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {isUploading && (
                  <Progress value={fileData.progress} className="h-1 mt-2" />
                )}
                {fileData.error && (
                  <p className="text-xs text-red-500 mt-1">{fileData.error}</p>
                )}
              </div>
              {!isUploading && (
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {!isUploading && !files.every(f => f.url) && (
            <Button
              onClick={uploadFiles}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Upload
            </Button>
          )}

          {isUploading && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
