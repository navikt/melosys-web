import { ElementType, useState } from "react";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import { sorterElementerEtterDato } from "../../utils/dato";

interface SorterbarListeProps {
  elementer?: object[];
  defaultChecked?: "ascending" | "descending";
  component: ElementType;
  sortingLegend: string;
  sortingPath: string;
  radioGroupName?: string;
  className?: string;
  landkoder?: object[];
}

function SorterbarListe({
  elementer = [],
  defaultChecked = "ascending",
  component: Component,
  sortingLegend,
  sortingPath,
  radioGroupName,
  className,
  ...props
}: SorterbarListeProps) {
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(defaultChecked);

  if (!elementer || elementer.length === 0) return null;

  const sortComparator = sorterElementerEtterDato(sortOrder, sortingPath) as (a: object, b: object) => number;
  const sorterteElementer = [...elementer].sort(sortComparator);
  const uniqueName = radioGroupName || Utils._uuid();

  return (
    <div className={className}>
      {elementer.length > 1 && (
        <Nav.RadioGroup onChange={setSortOrder} legend={sortingLegend} defaultValue={defaultChecked} name={uniqueName}>
          <Nav.Radio value="descending">Nyeste først</Nav.Radio>
          <Nav.Radio value="ascending">Eldste først</Nav.Radio>
        </Nav.RadioGroup>
      )}
      {sorterteElementer.map((element) => (
        <Component key={Utils._uuid()} sak={element} {...props} />
      ))}
    </div>
  );
}

export default SorterbarListe;
