import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import classNames from "classnames";

import * as Ikoner from "../../resources/images";

import "./kopierbarTekst.css";

interface KopierbarTekstProps {
  hovertekst?: string;
  children: string;
}

const KopierbarTekst = ({ hovertekst, children }: KopierbarTekstProps) => {
  const [visHoverTekst, setVisHoverTekst] = useState(true);
  const [erKopiert, setErKopiert] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setErKopiert(false);
      setVisHoverTekst(false);
    }, 1000);
  }, [erKopiert]);

  const containerCls = classNames({
    "kopierbar-tekst__container--kopiert": erKopiert,
    "kopierbar-tekst__container": !erKopiert,
  });

  return (
    <span
      className="kopierbar-tekst"
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
          <span>
            {children}
            {erKopiert ? <Ikoner.GreenCheckmark className="kopier-ikon" /> : <Ikoner.Kopier className="kopier-ikon" />}
          </span>
        </CopyToClipboard>
      </span>
    </span>
  );
};

export default KopierbarTekst;
