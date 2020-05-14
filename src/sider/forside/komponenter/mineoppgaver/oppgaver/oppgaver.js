import React, { Fragment, useState } from 'react';
import PT from 'prop-types';

import * as Utils from '../../../../../utils';
import * as Nav from '../../../../../utils/navFrontend';

import sortOppgaverByDate from './sortoppgaverbydate';

import './oppgaver.css';

const Oppgaver = ({
  oppgaver,
  defaultChecked,
  component,
  sortingLegend,
  sortingPath,
  radioGroupName,
}) => {
  const defaultOrder = defaultChecked === 'nyeste' ? 'descending' : 'ascending';
  const [sortOrder, setSortOrder] = useState(defaultOrder);

  if (!oppgaver) return null;

  const handleSortOrderChange = event => {
    setSortOrder(event.target.value);
  };

  const sorterteOppgaver = oppgaver.slice().sort(sortOppgaverByDate(sortOrder, sortingPath));
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
        sorterteOppgaver.map(oppgave => <Component key={Utils._uuid()} sak={oppgave} />)
      }
    </Fragment>
  );
};

Oppgaver.propTypes = {
  oppgaver: PT.arrayOf(PT.object),
  defaultChecked: PT.string,
  component: PT.elementType.isRequired,
  sortingLegend: PT.string.isRequired,
  sortingPath: PT.string.isRequired,
  radioGroupName: PT.string,
};

Oppgaver.defaultProps = {
  oppgaver: [],
  defaultChecked: 'eldste',
  radioGroupName: undefined,
};

export default Oppgaver;
