import { Button } from '@/components/ui/button';
import { armElementSelection, highlightSelection, isElementSelected } from './selection';

export function SelectionControls() {
  const handleSelectClick = () => {
    armElementSelection();
  };

  const handleHighlightClick = () => {
    highlightSelection();
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button size="sm" onClick={handleSelectClick}>
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

