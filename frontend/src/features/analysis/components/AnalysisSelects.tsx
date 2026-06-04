import {
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import type { SortOption } from "../types";

export const CustomPageSizeSelect = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [10, 20, 50];

  return (
    <div className="custom-select-wrapper">
      <Button
        variant="outline"
        size="sm"
        className="analysis-chip-button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        {value} / 페이지
        <IconChevronUp
          size={16}
          aria-hidden="true"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="custom-select-dropdown"
          >
            {options.map((option) => (
              <button
                key={option}
                className={`custom-select-option ${value === option ? "selected" : ""}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option} / 페이지
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CustomSortSelect = ({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { label: "위험도 높은순", value: "severity_desc" },
    { label: "위험도 낮은순", value: "severity_asc" },
    { label: "최신순", value: "time_desc" },
    { label: "과거순", value: "time_asc" },
  ] as const;

  const currentLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className="custom-select-wrapper">
      <Button
        variant="outline"
        size="sm"
        className="analysis-chip-button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        {currentLabel}
        <IconChevronDown
          size={16}
          aria-hidden="true"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="custom-select-dropdown--down"
            style={{ width: 140 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                className={`custom-select-option ${value === option.value ? "selected" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
