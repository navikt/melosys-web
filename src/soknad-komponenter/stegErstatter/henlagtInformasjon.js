import React from 'react';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../kodeverk';
import * as MPT from '../../proptypes';
import * as Nav from '../../utils/navFrontend';

import './henlagtInformasjon.css';

function begrunnelseBeskrivelse(begrunnelseKoder) {
  if (!begrunnelseKoder || begrunnelseKoder.length === 0) {
    return 'Ukjent grunn';
  }
  return KV.kodeTilTerm(begrunnelseKoder[0], MKV.KTObjects.begrunnelser.henleggelsesgrunner);
}

function henlagtTekstEllerBeskrivelse(behandlingsresultat) {
  const { begrunnelseKoder, begrunnelseFritekst } = behandlingsresultat;
  if (begrunnelseFritekst && begrunnelseFritekst.length > 1) {
    return begrunnelseFritekst;
  }
  return begrunnelseBeskrivelse(begrunnelseKoder);
}

const HenlagtInformasjon = ({ behandlingsresultat }) => {
  const henlagtTekst = henlagtTekstEllerBeskrivelse(behandlingsresultat);

  return (
    <section aria-label="henlagtStatus" className="henlagtStatus panelSeksjon stegErstatter">
      <Nav.Panel>
        <Nav.Row>
          <Nav.Systemtittel>Saken er henlagt:</Nav.Systemtittel>
        </Nav.Row>
        <p> { henlagtTekst } </p>
      </Nav.Panel>
    </section>
  );
};

HenlagtInformasjon.propTypes = {
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
};

export default HenlagtInformasjon;
