import classnames from "classnames";

import bem from "../../bemUtils";

import "./menylink.css";
import { FormEvent } from "react";

interface MenyLinkProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  iconSrc?: string;
  iconAltText?: string;
}

const menyLinkCls = bem("meny-link");

// Logikk for å legge inn whitespace etter slash
const brukWbrTagVedSlash = (label: string) => label.replace("/", "/<wbr>");

function MenyLink({ label, active, onClick, iconSrc, iconAltText }: MenyLinkProps) {
  const handleOnClick = (event: FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    onClick();
  };

  const containerClassnames = classnames(menyLinkCls.block);

  return (
    <li className={containerClassnames} aria-current={active ? true : undefined}>
      <button
        className={active ? menyLinkCls.elementWithModifier("button", "active") : menyLinkCls.element("button")}
        onClick={handleOnClick}
        type="button"
      >
        {brukWbrTagVedSlash(label)}
        {iconSrc && <img src={iconSrc} alt={iconAltText || ""} className={menyLinkCls.element("icon")} />}
      </button>
    </li>
  );
}

export default MenyLink;
