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

function LinkGroup({ label, links, onClick }: LinkGroupProps) {
  return (
    <ul className={linkgroupCls.block}>
      {label && (
        <li className={labelCls}>
          <Nav.BodyLong size="small">{label}</Nav.BodyLong>
        </li>
      )}
      {links.map(({ label: linkLabel, active, iconSrc, iconAltText }, index) => (
        <MenyLink
          key={linkLabel.replace(/ /g, "")}
          label={linkLabel}
          active={active}
          onClick={() => onClick(index)}
          iconSrc={iconSrc}
          iconAltText={iconAltText}
        />
      ))}
    </ul>
  );
}

export default LinkGroup;
