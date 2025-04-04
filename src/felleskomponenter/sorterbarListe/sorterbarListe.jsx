import { useState } from "react";
import PT from "prop-types";

import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import sorterElementerEtterDato from "./sorterElementerEtterDato";

function SorterbarListe({
  elementer = [],
  defaultChecked = "ascending",
  component,
  sortingLegend,
  sortingPath,
  radioGroupName,
  className,
  ...props
}) {
  const [sortOrder, setSortOrder] = useState(defaultChecked);

  if (!elementer?.length) return null;

  const sorterteElementer = elementer.slice().sort(sorterElementerEtterDato(sortOrder, sortingPath));
  const Component = component;
  const uniqueName = radioGroupName || Utils._uuid();

  return (
    <div className={className}>
      {elementer.length > 1 && (
        <Nav.RadioGroup onChange={setSortOrder} legend={sortingLegend} defaultValue={defaultChecked} name={uniqueName}>
          <Nav.Radio value="descending">Nyeste først</Nav.Radio>
          <Nav.Radio value="ascending">Eldste først</Nav.Radio>
        </Nav.RadioGroup>
      )}
      {sorterteElementer.map((oppgave) => (
        <Component key={Utils._uuid()} sak={oppgave} {...props} />
      ))}
    </div>
  );
}

SorterbarListe.propTypes = {
  elementer: PT.arrayOf(PT.object),
  defaultChecked: PT.string,
  component: PT.elementType.isRequired,
  sortingLegend: PT.string.isRequired,
  sortingPath: PT.string.isRequired,
  radioGroupName: PT.string,
  className: PT.string,
};

export default SorterbarListe;
