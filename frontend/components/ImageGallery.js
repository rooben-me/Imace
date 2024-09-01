import React, { useState } from "react";
import useImageStore from "../store/useImageStore";
import useSWR from "swr";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ImageGallery() {
  const { searchResults } = useImageStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { data: paginatedData, error: paginatedError } = useSWR(
    searchResults.length === 0
      ? `http://127.0.0.1:8000/paginated_images?page=${page}&page_size=${pageSize}`
      : null,
    fetcher
  );

  const imagesToDisplay =
    searchResults.length > 0 ? searchResults : paginatedData?.images;
  const totalImages =
    searchResults.length > 0 ? searchResults.length : paginatedData?.total;

  if (paginatedError) return <div>Failed to load images</div>;
  if (!imagesToDisplay) return <div>Loading...</div>;

  const totalPages = Math.ceil(totalImages / pageSize);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {searchResults.length > 0 ? "Search Results" : "Gallery"}
        {!searchResults.length > 0 && (
          <span className="text-gray-600 ml-2 mb-1 text-sm font-medium">
            ({totalImages} items)
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {imagesToDisplay.map((image, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out"
          >
            <img
              src={`http://127.0.0.1:8000/image/${encodeURIComponent(
                searchResults.length > 0 ? image.path : image
              )}`}
              alt={`Image ${index + 1}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              {searchResults.length > 0 && (
                <p className="text-indigo-600 font-medium text-sm">
                  {image.similarity.toFixed(2)}% match
                </p>
              )}
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {searchResults.length > 0 ? image.path : image}
              </h3>
            </div>
          </div>
        ))}
      </div>
      {searchResults.length === 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <Pagination className="justify-start">
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(page - 1)}
                  />
                </PaginationItem>
              )}

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isWithinRange =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 3 && pageNumber <= page + 3);

                if (isWithinRange) {
                  return (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={page === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (pageNumber === page - 4 && pageNumber > 1) ||
                  (pageNumber === page + 4 && pageNumber < totalPages)
                ) {
                  return <PaginationEllipsis key={index} />;
                }
                return null;
              })}

              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(page + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
          <Select
            onValueChange={handlePageSizeChange}
            value={pageSize.toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Images per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="24">24 per page</SelectItem>
              <SelectItem value="36">36 per page</SelectItem>
              <SelectItem value="48">48 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </section>
  );
}
