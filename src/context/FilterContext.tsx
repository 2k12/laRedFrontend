import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceRange: number;
  setPriceRange: (range: number) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedStore: string | null;
  setSelectedStore: (storeId: string | null) => void;
  selectedCurrency: string;
  setSelectedCurrency: (curr: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  showGhostDropsOnly: boolean;
  setShowGhostDropsOnly: (show: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(5000);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12);
  const [showGhostDropsOnly, setShowGhostDropsOnly] = useState(false);

  const value = {
    searchTerm,
    setSearchTerm,
    priceRange,
    setPriceRange,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedStore,
    setSelectedStore,
    selectedCurrency,
    setSelectedCurrency,
    page,
    setPage,
    totalPages,
    setTotalPages,
    limit,
    setLimit,
    showGhostDropsOnly,
    setShowGhostDropsOnly
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
