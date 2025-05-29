import { useState, ReactNode } from "react";
import * as Ikoner from "../../resources/images";
import "./collapsiblePanel.less";

interface CollapsiblePanelProps {
  defaultExpanded?: boolean;
  children: ReactNode;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

function CollapsiblePanel({ defaultExpanded = true, children, onToggle, className = "" }: CollapsiblePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className={`collapsible-panel ${expanded ? "expanded" : "collapsed"} ${className}`}>
      <div className="collapsible-panel__toggle">
        <button
          type="button"
          onClick={handleToggle}
          className="chevron-toggle-button"
          title={expanded ? "Skjul panel" : "Vis panel"}
        >
          {expanded ? <Ikoner.ChevronRight /> : <Ikoner.ChevronLeft />}
        </button>
      </div>
      <div className="collapsible-panel__content">{children}</div>
    </div>
  );
}

export default CollapsiblePanel;
