import React, { useEffect, useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';
import * as Api from '../../services/api';
import './sideDialogSedUnderArbeid.css';

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
        <Nav.Normaltekst>Opprettet: {Utils.dato.formatterDatoTilNorsk(opprettetDato)}</Nav.Normaltekst>
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

const SideDialogSedUnderArbeid = ({ behandlingID }) => {
  const [sedUnderArbeid, setSedUnderArbeid] = useState([]);

  const hentSedUnderArbeid = async () => {
    if (behandlingID !== -1 && sedUnderArbeid.length === 0) {
      try {
        const data = await Api.Sed.hentSedUnderArbeid(behandlingID);
        setSedUnderArbeid(data);
      } catch (e) {
        Utils.logger.error(e);
      }
    }
  };

  useEffect(() => {
    hentSedUnderArbeid();
  }, []);

  const kanViseListe = liste => liste && liste.constructor === Array && liste.length > 0;

  return (
    <div className="sedunderarbeid">
      {
        kanViseListe(sedUnderArbeid) ?
          sedUnderArbeid.map(sed => <EnkeltSedUnderArbeid {...sed} key={uuid()} />) :
          'For øyeblikket ingen SED under arbeid'
      }
    </div>
  );
};

SideDialogSedUnderArbeid.propTypes = {
  behandlingID: PT.number.isRequired,
};

export default SideDialogSedUnderArbeid;
