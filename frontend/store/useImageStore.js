import create from "zustand";
import axios from "axios";
import debounce from "lodash/debounce";

const useImageStore = create((set, get) => ({
  searchQuery: "",
  isSearching: false,
  searchResults: [],
  allImages: [],
  selectedFiles: [],
  isUploading: false,
  isDeleting: false,
  imagePoints: [],

  fetchAllImages: async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/all_images");
      set({ allImages: response.data });
    } catch (error) {
      console.error("Error fetching all images:", error);
    }
  },

  fetchImagePoints: async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/image_points");
      set({ imagePoints: response.data });
    } catch (error) {
      console.error("Error fetching image points:", error);
    }
  },

  debouncedSearch: debounce(async (query) => {
    if (query) {
      set({ isSearching: true });
      try {
        const response = await axios.post("http://127.0.0.1:8000/search", {
          query: query,
        });
        set({ searchResults: response.data });
      } catch (error) {
        console.error("Error during search:", error);
      }
      set({ isSearching: false });
    } else {
      set({ searchResults: [] });
    }
  }, 300),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().debouncedSearch(query);
  },

  handleUpload: async () => {
    set({ isUploading: true });
    const formData = new FormData();
    get().selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({ selectedFiles: [] });
      get().fetchAllImages();
    } catch (error) {
      console.error("Error uploading images:", error);
    }
    set({ isUploading: false });
  },

  handleDelete: async () => {
    set({ isDeleting: true });
    try {
      await axios.post("http://127.0.0.1:8000/delete_all");
      set({ allImages: [], searchResults: [] });
    } catch (error) {
      console.error("Error deleting all data:", error);
    }
    set({ isDeleting: false });
  },

  handleCancelUpload: (index) => {
    set({
      selectedFiles: get().selectedFiles.filter((_, i) => i !== index),
    });
  },

  setSelectedFiles: (files) => set({ selectedFiles: files }),
}));

export default useImageStore;
