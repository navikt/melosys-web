import classnames from "classnames";

import * as Utils from "../../utils";
import bem from "../../bemUtils";
import LinkGroup from "./linkgroup";
import { Link } from "./types";

import "./sidemeny.css";

const sideMenyCls = bem("side-meny");

interface LinkGroupInterface {
  label?: string;
  links: Link[];
}

interface SideMenyProps {
  heading?: string;
  linkGroups: LinkGroupInterface[];
  onClick: (groupIndex: number, linkIndex: number) => void;
}

function SideMeny({ linkGroups, heading, onClick }: SideMenyProps): JSX.Element {
  const sideMenyRootClassnames = classnames(sideMenyCls.block);

  return (
    <div className={sideMenyRootClassnames}>
      <div className={sideMenyCls.element("container")}>
        {heading && (
          <h2 className={sideMenyCls.element("heading")} id="opplysninger">
            {heading}
          </h2>
        )}
        <nav aria-labelledby="opplysninger">
          {linkGroups.map(({ label, links }, index) => (
            <LinkGroup
              key={label || Utils._uuid()}
              label={label}
              links={links}
              onClick={(linkIndex) => onClick(index, linkIndex)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

export default SideMeny;
