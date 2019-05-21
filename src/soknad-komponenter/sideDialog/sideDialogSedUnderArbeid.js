import React, { useState, useEffect } from 'react';
import PT from 'prop-types';

import { connect } from 'react-redux';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils/dato';
import './sideDialogSedUnderArbeid.css';
import * as sedOperations from '../../ducks/sed/operations';

const uuid = require('uuid/v4');

// Per i dag finnes det bare status=new, men legger til rette for støtte av flere statuser.
const STATUS_UTKAST = 'new';
const StatusEtikett = ({ status }) => (
  status === STATUS_UTKAST &&
    <Nav.EtikettBase type="fokus">Utkast</Nav.EtikettBase>
);

StatusEtikett.propTypes = {
  status: PT.string.isRequired,
};

const EnkeltSedUnderArbeid = ({
  rinaUrl, sedType, opprettetDato, status,
}) => (
  <Nav.LenkepanelBase href={rinaUrl} border>
    <Nav.Row>
      <Nav.Column xs="4">
        <Nav.Undertittel>{sedType}</Nav.Undertittel>
        <Nav.Normaltekst>Opprettet: {Utils.formatterDatoTilNorsk(opprettetDato)}</Nav.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="4" className="status-etikett">
        <StatusEtikett status={status} />
      </Nav.Column>
      <Nav.Column xs="4">
        <Nav.Undertittel className="lenkepanel__heading">GÅ TIL RINA</Nav.Undertittel>
      </Nav.Column>
    </Nav.Row>
  </Nav.LenkepanelBase>
);

EnkeltSedUnderArbeid.propTypes = {
  rinaUrl: PT.string.isRequired,
  sedType: PT.string.isRequired,
  opprettetDato: PT.string.isRequired,
  status: PT.string.isRequired,
};

const SideDialogSedUnderArbeid = ({ hentSedUnderArbeid }) => {
  const [sedUnderArbeid, setSedUnderArbeid] = useState(null); // TODO: Må lagres til store for å unngå flere kall

  const hentOgSettSedUnderArbeid = async () => {
    const response = await hentSedUnderArbeid('4'); // TODO: Hent behandlingID.
    setSedUnderArbeid(response.data);
  };

  useEffect(() => {
    hentOgSettSedUnderArbeid();
  }, []);

  const kanViseListe = liste => liste && liste.constructor === Array && liste.length > 0;

  return (
    <div className="sedunderarbeid">
      {
        kanViseListe(sedUnderArbeid) ?
          sedUnderArbeid.map(sed => <EnkeltSedUnderArbeid {...sed} key={uuid()} />) :
          'For øyeblikket ingen SED under arbeid' // TODO: Trenger en tekst e.l.
      }
    </div>
  );
};

SideDialogSedUnderArbeid.propTypes = {
  hentSedUnderArbeid: PT.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  hentSedUnderArbeid: behandlingID => dispatch(sedOperations.hentSedUnderArbeid(behandlingID)),
  // TODO: Må hente sak/behandling
});

export default connect(null, mapDispatchToProps)(SideDialogSedUnderArbeid);
