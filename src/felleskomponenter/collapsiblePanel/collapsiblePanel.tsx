import { useState, ReactNode } from "react";
import * as Ikoner from "../../resources/images";
import "./collapsiblePanel.less";

interface CollapsiblePanelProps {
  defaultExpanded?: boolean;
  children: ReactNode;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  direction: "LEFT" | "RIGHT";
}

function CollapsiblePanel({
  defaultExpanded = true,
  children,
  onToggle,
  className = "",
  direction,
}: CollapsiblePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const getIcon = () => {
    if (direction === "RIGHT") {
      return expanded ? <Ikoner.ChevronRight /> : <Ikoner.ChevronLeft />;
    }
    // direction === "LEFT"
    return expanded ? <Ikoner.ChevronLeft /> : <Ikoner.ChevronRight />;
  };

  const directionClass =
    direction === "LEFT" ? "collapsible-panel--direction-left" : "collapsible-panel--direction-right";

  return (
    <div className={`collapsible-panel ${expanded ? "expanded" : "collapsed"} ${className} ${directionClass}`}>
      <div className="collapsible-panel__toggle">
        <button
          type="button"
          onClick={handleToggle}
          className="chevron-toggle-button"
          title={expanded ? "Skjul panel" : "Vis panel"}
        >
          {getIcon()}
        </button>
      </div>
      <div className="collapsible-panel__content">{children}</div>
    </div>
  );
}

export default CollapsiblePanel;
