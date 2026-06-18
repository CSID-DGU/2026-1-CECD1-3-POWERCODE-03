import { IconChevronDown, IconFilter } from "@tabler/icons-react";
import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/Modal";

export const AnalysisFilterDialog = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      trigger={
        <Button className="analysis-chip-button" size="sm" variant="outline">
          <IconFilter size={16} aria-hidden="true" />
          검색 필터
          <IconChevronDown size={16} aria-hidden="true" />
        </Button>
      }
      title="검색 필터 설정"
      description="목록에 표시할 이상 로그의 조건을 설정합니다."
    >
      <div className="analysis-filter-dialog">
        <FilterOptionGroup
          title="위험도 (Severity)"
          options={["Critical", "Warning", "Info"]}
        />
        <FilterOptionGroup
          title="상태 (Status)"
          options={["Open", "Detected", "Resolved"]}
        />
      </div>
    </Modal>
  );
};

const FilterOptionGroup = ({
  title,
  options,
}: {
  title: string;
  options: string[];
}) => {
  return (
    <div className="analysis-filter-group">
      <strong>{title}</strong>
      <div className="analysis-filter-group__options">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            size="sm"
            className="analysis-chip-button"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};
