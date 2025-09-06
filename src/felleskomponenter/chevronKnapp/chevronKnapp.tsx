import * as Ikoner from "../../resources/images";
import "./chevronKnapp.less";

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
        {expanded ? <Ikoner.ChevronUp /> : <Ikoner.ChevronDown />}
      </button>
    </div>
  );
}

export default ChevronKnapp;
