import classnames from "classnames";
import TypografiBase from "nav-frontend-typografi";
import * as React from "react";

import bem from "./bemUtils";

import "./menylink.css";

interface MenyLinkProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  iconSrc?: string;
  iconAltText?: string;
}

const menyLinkCls = bem("meny-link");

const MenyLink = ({ label, active, onClick, iconSrc, iconAltText }: MenyLinkProps) => {
  const handleOnClick = (event: React.FormEvent<HTMLButtonElement>): void => {
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
          {label}
          {iconSrc && <img src={iconSrc} alt={iconAltText || ""} className={menyLinkCls.element("icon")} />}
        </TypografiBase>
      </button>
    </li>
  );
};

export default MenyLink;
