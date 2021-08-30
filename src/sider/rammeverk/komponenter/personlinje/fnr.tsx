import React, { useState } from "react";
import { GreenCheckmark, Kopier } from "../../../../resources/images";
import "./personlinje.css";

type FnrProps = {
  fnr: string;
};

const Fnr = ({ fnr }: FnrProps) => {
  const [visKopierTekst, setVisKopierTekst] = useState(false);
  const [visKopiert, setVisKopiert] = useState(false);

  const handleKopierFnr = () => {
    navigator.clipboard.writeText(fnr);
    setVisKopiert(true);
  };

  const handleKeyPressKopierFnr = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleKopierFnr();
    }
  };

  const handleMouseHover = () => {
    setVisKopierTekst(true);
  };

  const handleMouseLeave = () => {
    setVisKopiert(false);
    setVisKopierTekst(false);
  };

  return (
    <div className="personlinje__fnr">
      <div
        className="fnr"
        role="button"
        tabIndex={0}
        onClick={handleKopierFnr}
        onKeyPress={handleKeyPressKopierFnr}
        onKeyUp={handleKeyPressKopierFnr}
        onMouseLeave={handleMouseLeave}
        onMouseOver={handleMouseHover}
        onFocus={handleMouseHover}
        onBlur={handleMouseLeave}
      >
        {fnr}
        {visKopiert ? <GreenCheckmark className="kopier-ikon" /> : <Kopier className="kopier-ikon" />}
      </div>
      {visKopierTekst ? (
        <div className="kopier-hovertekst">{visKopiert ? "Kopiert" : "Kopier fødselsnummer"}</div>
      ) : null}
    </div>
  );
};

export default Fnr;
