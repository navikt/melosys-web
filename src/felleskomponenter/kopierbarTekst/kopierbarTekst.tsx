import { useEffect, useState } from "react";
import classNames from "classnames";

import * as Ikoner from "../../resources/images";

import "./kopierbarTekst.css";

interface KopierbarTekstProps {
  className?: string;
  hovertekst?: string;
  children: string;
}

function KopierbarTekst({ className, hovertekst, children }: KopierbarTekstProps) {
  const [visHoverTekst, setVisHoverTekst] = useState(false);
  const [erKopiert, setErKopiert] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (erKopiert) {
      timer = setTimeout(() => {
        setErKopiert(false);
        setVisHoverTekst(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [erKopiert]);

  const containerCls = classNames("kopierbar-tekst__container", { "kopierbar-tekst__container__hover": visHoverTekst });
  const kopierIkonCls = classNames("kopierbar-tekst__kopier-ikon");

  const handleCopy = async () => {
    if (typeof children === "string") {
      try {
        await navigator.clipboard.writeText(children);
        setErKopiert(true);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

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
        <button type="button" onClick={handleCopy}>
          {children}
          {erKopiert ? (
            <Ikoner.GreenCheckmark className={kopierIkonCls} />
          ) : (
            <Ikoner.Kopier className={kopierIkonCls} />
          )}
        </button>
      </span>
    </span>
  );
}

export default KopierbarTekst;
