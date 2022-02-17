import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import classNames from "classnames";

import * as Ikoner from "../../resources/images";

import "./kopierbarTekst.css";

interface KopierbarTekstProps {
  className?: string;
  hovertekst?: string;
  children: string;
}

const KopierbarTekst = ({ className, hovertekst, children }: KopierbarTekstProps) => {
  const [visHoverTekst, setVisHoverTekst] = useState(false);
  const [erKopiert, setErKopiert] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setErKopiert(false);
      setVisHoverTekst(false);
    }, 1000);
  }, [erKopiert]);

  const containerCls = classNames("kopierbar-tekst__container", { "kopierbar-tekst__container__hover": visHoverTekst });
  const kopierIkonCls = classNames("kopierbar-tekst__kopier-ikon");

  return (
    <span
      className={classNames("kopierbar-tekst", className)}
      onMouseOver={() => setVisHoverTekst(true)}
      onFocus={() => setVisHoverTekst(true)}
      onMouseLeave={() => setVisHoverTekst(false)}
      onBlur={() => setVisHoverTekst(false)}
    >
      {hovertekst && visHoverTekst && (
        <div className="kopierbar-tekst__hovertekst">{erKopiert ? "Kopiert" : hovertekst}</div>
      )}
      <span className={containerCls}>
        <CopyToClipboard text={children} onCopy={() => setErKopiert(true)}>
          <button type="button">
            {children}
            {erKopiert ? (
              <Ikoner.GreenCheckmark className={kopierIkonCls} />
            ) : (
              <Ikoner.Kopier className={kopierIkonCls} />
            )}
          </button>
        </CopyToClipboard>
      </span>
    </span>
  );
};

export default KopierbarTekst;
