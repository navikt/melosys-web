import React, { ReactNode } from "react";
import "./handling.css";

type handlingProps = {
  ikon?: ReactNode;
  tekst: string;
  onClick: () => void;
};

const Handling = ({ ikon, tekst, onClick }: handlingProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      onClick();
    }
  };

  return (
    <div className="behandlingsmeny__handling" role="button" tabIndex={0} onKeyPress={handleKeyPress} onClick={onClick}>
      {ikon}
      {tekst}
    </div>
  );
};

export default Handling;
