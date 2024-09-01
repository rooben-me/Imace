import React from "react";
import { FaUpload, FaTrash, FaX } from "react-icons/fa";
import useImageStore from "../store/useImageStore";
import { FaXmark } from "react-icons/fa6";

export default function Settings() {
  const {
    selectedFiles,
    setSelectedFiles,
    isUploading,
    handleUpload,
    isDeleting,
    handleDelete,
    handleCancelUpload,
  } = useImageStore();

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  return (
    <section className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Images with Preview */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload Images
          </h2>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md font-medium text-base text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaUpload className="mr-2 text-sm text-gray-500" />
            <span>Select Images</span>
          </label>

          {/* Image Preview */}
          {selectedFiles.length > 0 && (
            <>
              <div className="my-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-80 p-2 rounded-lg border borer-gray-200">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-auto rounded-md"
                    />
                    <button
                      className="absolute top-0 right-0 p-2 rounded-md rounded-t-none rounded-r-none bg-red-600/70 border border-red-200/50 backdrop-blur-sm hover:bg-red-500/80 focus:outline-none"
                      onClick={() => handleCancelUpload(index)}
                    >
                      <FaXmark className="text-red-100/70 text-sm" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${
                  isUploading || selectedFiles.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    Uploading...
                  </div>
                ) : (
                  <span>Upload Images</span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Delete All Data */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Delete All Data
          </h2>
          <button
            className={`w-full bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  viewBox="0 0 24 24"
                >
                  {/* ... (loading spinner) */}
                </svg>
                Deleting...
              </div>
            ) : (
              <span>Delete All Data</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
