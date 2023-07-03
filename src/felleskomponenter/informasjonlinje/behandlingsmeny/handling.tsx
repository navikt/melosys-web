import { ReactNode } from "react";
import "./handling.css";

type handlingProps = {
  ikon?: ReactNode;
  tekst: string;
  onClick: () => void;
  disabled?: boolean;
};

const Handling = ({ ikon, tekst, onClick, disabled = false }: handlingProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      onClick();
    }
  };

  return disabled ? (
    <div className="behandlingsmeny__handling">
      {ikon && <div className="behandlingsmeny__handling__ikon">{ikon}</div>}
      <div className="behandlingsmeny__handling__tekst-disabled">{tekst}</div>
    </div>
  ) : (
    <div className="behandlingsmeny__handling" role="button" tabIndex={0} onKeyPress={handleKeyPress} onClick={onClick}>
      {ikon && <div className="behandlingsmeny__handling__ikon">{ikon}</div>}
      <div className="behandlingsmeny__handling__tekst">{tekst}</div>
    </div>
  );
};

export default Handling;
