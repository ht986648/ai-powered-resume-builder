"use client";

import { Inbox } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus("File too large. Please upload a file smaller than 10MB.");
        return;
      }

      setIsProcessing(true);
      setUploadStatus("Uploading file to S3...");

      try {
        // Upload to S3 via API route
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          setUploadStatus("❌ Error uploading file: " + uploadResult.error);
          return;
        }

        setUploadStatus("Generating vector embeddings...");

        // Process PDF and generate embeddings
        const response = await fetch("/api/process-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileKey: uploadResult.file_key,
            fileName: uploadResult.file_name,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setUploadStatus("✅ PDF processed successfully! Redirecting to chat...");
          console.log("Chat created with ID:", result.chatId);
          
          // Redirect to chat page after a short delay
          setTimeout(() => {
            router.push(`/chat/${result.chatId}`);
          }, 1500);
        } else {
          setUploadStatus("❌ Error processing PDF: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
        setUploadStatus("❌ Error uploading or processing file");
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        ) : (
          <Inbox className="w-10 h-10 text-blue-500" />
        )}
        <p className="mt-2 text-sm text-slate-400">
          {isProcessing ? "Processing..." : "Drop PDF Here"}
        </p>
        {uploadStatus && (
          <p className="mt-2 text-sm text-center max-w-xs">
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
