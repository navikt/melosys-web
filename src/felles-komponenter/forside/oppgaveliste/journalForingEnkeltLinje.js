import React from 'react';
import PT from 'prop-types';
import { Link } from 'react-router-dom';

import * as Nav from '../../../utils/navFrontend';
import * as Ikoner from '../../../resources/images';

import PanelHeader from '../../../felles-komponenter/panelHeader/panelHeader';

import './journalForingEnkeltLinje.css';

const JournalForingEnkeltLinje = ({ sak }) => {
  const { journalpostID, aktivTil } = sak;
  const tittel = 'Journalføring';
  const link = `/journalforing/${journalpostID}`;

  const undertittel = () => (
    <Nav.Row>
      <Nav.Column xs="12" md="6">
        <dl className="journalEnkeltLinje__meta">
          <dt className="journalEnkeltLinje__meta__term">Frist:</dt>
          <dd className="journalEnkeltLinje__meta__detalj">{aktivTil}</dd>
        </dl>
      </Nav.Column>
    </Nav.Row>
  );

  return (
    <Link to={link} className="journalEnkeltLinje__link">
      <Nav.Panel className="journalEnkeltLinje">
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={undertittel()} />
      </Nav.Panel>
    </Link>
  );
};

JournalForingEnkeltLinje.propTypes = {
  sak: PT.shape({
    oppgavetype: PT.object.isRequired,
    journalpostID: PT.string.isRequired,
  }),
};

JournalForingEnkeltLinje.defaultProps = {
  sak: {},
};

export default JournalForingEnkeltLinje;
