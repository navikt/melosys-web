import React from "react";

import * as Nav from "../../navFrontend";

import bem from "./bemUtils";
import MenyLink from "./menylink";
import { Link } from "./types";

import "./linkgroup.css";

interface LinkGroupProps {
  label: string;
  links: Link[];
  onClick: (index: number) => void;
}

const linkgroupCls = bem("linkgroup");
const labelCls = linkgroupCls.element("label");

const LinkGroup = ({ label, links, onClick }: LinkGroupProps) => (
  <div className={linkgroupCls.block}>
    <Nav.Typo.Normaltekst className={labelCls}>{label}</Nav.Typo.Normaltekst>
    {links.map(({ label: linkLabel, active, iconSrc, iconAltText }, index) => (
      <MenyLink
        key={linkLabel.split(" ").join("")}
        label={linkLabel}
        active={active}
        onClick={() => onClick(index)}
        iconSrc={iconSrc}
        iconAltText={iconAltText}
      />
    ))}
  </div>
);

export default LinkGroup;
