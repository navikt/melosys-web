import * as Nav from "../../navFrontend";

import bem from "../../bemUtils";
import MenyLink from "./menylink";
import { Link } from "./types";

import "./linkgroup.css";

interface LinkGroupProps {
  label?: string;
  links: Link[];
  onClick: (index: number) => void;
}

const linkgroupCls = bem("linkgroup");
const labelCls = linkgroupCls.element("label");

const LinkGroup = ({ label, links, onClick }: LinkGroupProps) => (
  <ul className={linkgroupCls.block}>
    {label && (
      <li className={labelCls}>
        <Nav.BodyLong size="small">{label}</Nav.BodyLong>
      </li>
    )}
    {links.map(({ label: linkLabel, active, iconSrc, iconAltText }, index) => (
      <li key={linkLabel.split(" ").join("")}>
        <MenyLink
          label={linkLabel}
          active={active}
          onClick={() => onClick(index)}
          iconSrc={iconSrc}
          iconAltText={iconAltText}
        />
      </li>
    ))}
  </ul>
);

export default LinkGroup;
