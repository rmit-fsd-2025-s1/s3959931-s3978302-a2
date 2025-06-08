import React from "react";
import { motion } from "framer-motion";
import SearchInput from "@/shared/components/common/search-input/SearchInput";
import styles from "./SearchFilters.module.css";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: "all" | "applied" | "available" | "unavailable";
  onFilterChange: (
    filter: "all" | "applied" | "available" | "unavailable"
  ) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <motion.div
      className={styles.searchFiltersContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="container">
        {/* Search Bar */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Smart search: 'data tutor', 'web lab', 'programming'..."
          showLabel={false}
          variant="rounded"
        />

        {/* Filter Pills */}
        <div className={styles.filterPills}>
          <button
            className={`${styles.filterPill} ${
              activeFilter === "all" ? styles.filterPillActive : ""
            }`}
            onClick={() => onFilterChange("all")}
          >
            All Courses
          </button>
          <button
            className={`${styles.filterPill} ${
              activeFilter === "available" ? styles.filterPillActive : ""
            }`}
            onClick={() => onFilterChange("available")}
          >
            Available
          </button>
          <button
            className={`${styles.filterPill} ${
              activeFilter === "applied" ? styles.filterPillActive : ""
            }`}
            onClick={() => onFilterChange("applied")}
          >
            Applied
          </button>
          <button
            className={`${styles.filterPill} ${
              activeFilter === "unavailable" ? styles.filterPillActive : ""
            }`}
            onClick={() => onFilterChange("unavailable")}
          >
            Unavailable
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilters;
