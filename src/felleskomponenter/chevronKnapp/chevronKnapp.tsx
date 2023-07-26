import * as Nav from "../../navFrontend";
import "./chevronKnapp.css";

interface ChevronKnappProps {
  expanded: boolean;
  onChange: () => void;
  label: string;
}

function ChevronKnapp({ expanded, onChange, label }: ChevronKnappProps) {
  return (
    <div className="chevronKnapp">
      <button type="button" onClick={onChange}>
        {label}
        <Nav.Chevron type={expanded ? "opp" : "ned"} />
      </button>
    </div>
  );
}

export default ChevronKnapp;
