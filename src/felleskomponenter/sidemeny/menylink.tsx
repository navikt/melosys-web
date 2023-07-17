import classnames from "classnames";
import TypografiBase from "nav-frontend-typografi";

import parse from "html-react-parser";
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
const brukWbrTagVedSlash = (label: string) => parse(label.replace("/", "/<wbr>"));

const MenyLink = ({ label, active, onClick, iconSrc, iconAltText }: MenyLinkProps) => {
  const handleOnClick = (event: FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    onClick();
  };

  const labelCls = classnames(
    active ? menyLinkCls.elementWithModifier("label", "active") : menyLinkCls.element("label"),
    {
      [menyLinkCls.elementWithModifier("label", "with-icon")]: !!iconSrc,
    }
  );

  const containerClassnames = classnames(menyLinkCls.block);

  const labeltype = "normaltekst";

  return (
    <li className={containerClassnames} aria-current={active ? true : undefined}>
      <button
        className={active ? menyLinkCls.elementWithModifier("button", "active") : menyLinkCls.element("button")}
        onClick={handleOnClick}
        type="button"
      >
        <TypografiBase type={labeltype} tag="span" className={labelCls}>
          {brukWbrTagVedSlash(label)}
          {iconSrc && <img src={iconSrc} alt={iconAltText || ""} className={menyLinkCls.element("icon")} />}
        </TypografiBase>
      </button>
    </li>
  );
};

export default MenyLink;
