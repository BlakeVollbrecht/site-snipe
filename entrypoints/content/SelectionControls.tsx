import { Button } from '@/components/ui/button';
import {
  armElementSelection,
  highlightSelection,
  isElementSelected,
  isSelectionArmed,
} from './selection';

export function SelectionControls() {
  const handleSelectClick = () => {
    armElementSelection();
  };

  const handleHighlightClick = () => {
    highlightSelection();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={handleSelectClick} disabled={isSelectionArmed()}>
        Select element on page
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleHighlightClick}
        disabled={!isElementSelected()}
      >
        Highlight selected element
      </Button>
    </div>
  );
}

