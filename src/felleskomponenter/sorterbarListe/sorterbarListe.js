import React, { Fragment, useState } from 'react';
import PT from 'prop-types';

import * as Utils from '../../utils';
import * as Nav from '../../utils/navFrontend';

import sorterElementerEtterDato from './sorterElementerEtterDato';

import './sorterbarListe.css';

const SorterbarListe = ({
  elementer,
  defaultChecked,
  component,
  sortingLegend,
  sortingPath,
  radioGroupName,
}) => {
  const defaultOrder = defaultChecked === 'nyeste' ? 'descending' : 'ascending';
  const [sortOrder, setSortOrder] = useState(defaultOrder);

  if (!elementer) return null;

  const handleSortOrderChange = event => {
    setSortOrder(event.target.value);
  };

  const sorterteElementer = elementer.slice().sort(sorterElementerEtterDato(sortOrder, sortingPath));
  const Component = component;
  const uniqueName = radioGroupName || Utils._uuid();

  return (
    <Fragment>
      <Nav.Fieldset className="sorteringRadiogruppe" onChange={handleSortOrderChange} legend={sortingLegend}>
        <div>
          <Nav.Radio
            name={uniqueName}
            label="Nyeste først"
            value="descending"
            defaultChecked={defaultChecked === 'nyeste'}
          />
          <Nav.Radio
            name={uniqueName}
            label="Eldste først"
            value="ascending"
            defaultChecked={defaultChecked === 'eldste'}
          />
        </div>
      </Nav.Fieldset>
      {
        sorterteElementer.map(oppgave => <Component key={Utils._uuid()} sak={oppgave} />)
      }
    </Fragment>
  );
};

SorterbarListe.propTypes = {
  elementer: PT.arrayOf(PT.object),
  defaultChecked: PT.string,
  component: PT.elementType.isRequired,
  sortingLegend: PT.string.isRequired,
  sortingPath: PT.string.isRequired,
  radioGroupName: PT.string,
};

SorterbarListe.defaultProps = {
  elementer: [],
  defaultChecked: 'eldste',
  radioGroupName: undefined,
};

export default SorterbarListe;
