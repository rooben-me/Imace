import React from "react";
import { FaSearch } from "react-icons/fa";
import useImageStore from "../store/useImageStore";

export default function SearchBar() {
  const { searchQuery, setSearchQuery, isSearching } = useImageStore();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="mb-12">
      <div className="relative flex items-center rounded-xl bg-white">
        <input
          id="search-query"
          type="text"
          className="w-full px-6 py-4 pl-14 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200"
          placeholder="Search images..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FaSearch className="absolute left-6 stroke-0.5 text-gray-400" />
        {isSearching && (
          <svg
            className="animate-spin h-5 w-5 text-indigo-600 absolute right-3"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
