import React, { useEffect, useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as Api from '../../../services/api';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';

import './journalforingautomatisksed.css';

const JournalforingAutomatiskSED = ({
  brukerID,
  avsenderID,
  avsenderNavn,
  sakstype,
  behandlingstype,
  formIsValid,
}) => {
  const [bruker, setBruker] = useState({});

  const hentBruker = async fnrdnr => {
    try {
      const response = await Api.Personer.hentPerson(fnrdnr);
      setBruker(response);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  useEffect(() => {
    if (!formIsValid) return;
    hentBruker(brukerID);
  }, [brukerID]);

  return (
    <form>
      <Nav.Undertittel className="undertittel oversteUndertittel">Informasjon om bruker</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input className="fetTekst" label="Brukers f.nr eller d.nr" feltNavn="brukerId" />
          <Nav.Element>Brukers fulle navn</Nav.Element>
          <Nav.Normaltekst>{bruker.sammensattNavn}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Undertittel className="undertittel">Informasjon om avsender</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Element>Avsender ID</Nav.Element>
          <Nav.Normaltekst>{avsenderID}</Nav.Normaltekst>
          <Nav.Element>Avsenders navn</Nav.Element>
          <Nav.Normaltekst>{avsenderNavn}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Undertittel className="undertittel">Saksinformasjon</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="5">
          <Nav.Element>Sakstype</Nav.Element>
          <Nav.Normaltekst>{sakstype.term}</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="7">
          <Nav.Element>Behandlingstype</Nav.Element>
          <Nav.Normaltekst>{behandlingstype.term}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
    </form>
  );
};

JournalforingAutomatiskSED.propTypes = {
  brukerID: PT.string,
  avsenderNavn: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  sakstype: MPT.Kodeverk.isRequired,
  behandlingstype: MPT.Kodeverk.isRequired,
  formIsValid: PT.bool.isRequired,
};

JournalforingAutomatiskSED.defaultProps = {
  brukerID: '',
};

export default JournalforingAutomatiskSED;
