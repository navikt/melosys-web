import { Normaltekst } from "nav-frontend-typografi";
import * as React from "react";
import classnames from "classnames";

import bem from "../../bemUtils";
import LinkGroup from "./linkgroup";
import { Link } from "./types";

import "./sidemeny.css";

const sideMenyCls = bem("side-meny");

interface LinkGroupInterface {
  label: string;
  links: Link[];
}

interface SideMenyProps {
  heading?: string;
  linkGroups: LinkGroupInterface[];
  onClick: (groupIndex: number, linkIndex: number) => void;
}

const SideMeny = ({ linkGroups, heading, onClick }: SideMenyProps): JSX.Element => {
  const sideMenyRootClassnames = classnames(sideMenyCls.block);

  return (
    <div className={sideMenyRootClassnames}>
      <nav className={sideMenyCls.element("container")}>
        {heading && <Normaltekst className={sideMenyCls.element("heading")}>{heading}</Normaltekst>}
        <ul className={sideMenyCls.element("link-list")}>
          {linkGroups.map(({ label, links }, index) => (
            <LinkGroup key={label} label={label} links={links} onClick={(linkIndex) => onClick(index, linkIndex)} />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideMeny;
