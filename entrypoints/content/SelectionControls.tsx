import './SelectionControls.css';
import { armElementSelection, highlightSelection } from './selection';

export function SelectionControls() {
  const handleSelectClick = () => {
    armElementSelection();
  };

  const handleHighlightClick = () => {
    highlightSelection();
  };

  return (
    <div className="site-snipe-selection">
      <button className="site-snipe-selection-button" onClick={handleSelectClick}>
        Select element on page
      </button>
      <button className="site-snipe-selection-button" onClick={handleHighlightClick}>
        Highlight selected element
      </button>
    </div>
  );
}

