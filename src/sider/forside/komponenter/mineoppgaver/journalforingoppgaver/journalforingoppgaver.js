import React, { Fragment, useState } from 'react';
import PT from 'prop-types';

import * as Utils from '../../../../../utils';
import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import JournalforingOppgave from '../../../../../felleskomponenter/oppgaveliste/journalforingOppgave';
import sortOppgaverByDate from '../sortoppgaverbydate';

const JournalforingOppgaver = ({
  journalforinger,
  defaultChecked,
}) => {
  const [sortOrder, setSortOrder] = useState('ascending');

  if (!journalforinger) return null;

  const handleSortOrderChange = event => {
    setSortOrder(event.target.value);
  };

  const sorterteJournalforinger = journalforinger.slice().sort(sortOppgaverByDate(sortOrder, 'aktivTil'));

  return (
    <Fragment>
      <Nav.Fieldset className="sorteringRadiogruppe" onChange={handleSortOrderChange} legend="Sorter journalføringsoppgaver etter frist:">
        <div>
          <Nav.Radio
            name="journalforingOppgaverSortering"
            label="Nyeste først"
            value="descending"
            defaultChecked={defaultChecked === 'nyeste'}
          />
          <Nav.Radio
            name="journalforingOppgaverSortering"
            label="Eldste først"
            value="ascending"
            defaultChecked={defaultChecked === 'eldste'}
          />
        </div>
      </Nav.Fieldset>
      {
        sorterteJournalforinger.map(oppgave => <JournalforingOppgave key={Utils._uuid()} sak={oppgave} />)
      }
    </Fragment>
  );
};

JournalforingOppgaver.propTypes = {
  journalforinger: PT.arrayOf(MPT.JournalforingOppgave),
  defaultChecked: PT.string,
};

JournalforingOppgaver.defaultProps = {
  journalforinger: [],
  defaultChecked: 'eldste',
};

export default JournalforingOppgaver;
