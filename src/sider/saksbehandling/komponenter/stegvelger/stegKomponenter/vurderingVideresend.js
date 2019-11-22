import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../../../melosyskodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';
import * as Utils from '../../../../../utils';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';
import * as Api from '../../../../../services/api';
import useEventTargetValueState from '../../../../../hooks/useEventTargetValueState';

import './vurderingVideresend.css';
import { useAsyncCallbackState } from '../../../../../hooks/useCallbackState';

const uuid = require('uuid/v4');

export const VurderingVideresend = ({
  redigerbart,
  videresendSoknad,
  behandlingID,
  bostedsland,
}) => {
  const hentMottakerinstitusjoner = async () =>
    Api.Eessi.mottakerinstitusjoner.hent(EKV.Koder.buctyper.legislation.LA_BUC_03, bostedsland.kode);

  const [mottakerinstitusjoner] = useAsyncCallbackState(hentMottakerinstitusjoner, []);
  const [valgtMottakerinstitusjon, setValgtMottakerinstitusjon] = useEventTargetValueState(null);

  useEffect(() => {
    if (!Utils._isEmpty(mottakerinstitusjoner)) {
      const event = { target: { value: mottakerinstitusjoner[0].id } };
      setValgtMottakerinstitusjon(event);
    }
  }, [mottakerinstitusjoner]);

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis orienteringsbrev',
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_VIDERESENDT_SOEKNAD,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis SED A008',
      type: EKV.Koder.sedtyper.A008,
      erSed: true,
    },
  ];

  const vedKlikkVideresend = () => videresendSoknad(valgtMottakerinstitusjon);

  const skalSendeSed = mottakerinstitusjoner.length > 0;

  return (
    <div>
      <Nav.typo.Undertittel>Videresending av søknad</Nav.typo.Undertittel>
      {
        skalSendeSed &&
        <Nav.Row className="mottakerinstitusjoner">
          <Nav.Column xs="7">
            <Nav.Select label="Velg utenlandsk institusjon som skal motta SED" onChange={setValgtMottakerinstitusjon} disabled={!redigerbart}>
              <option key={uuid()} value="" disabled>Velg...</option>
              {mottakerinstitusjoner.map(institusjon => <option key={institusjon.id} value={institusjon.id}>{institusjon.navn}</option>)}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      }
      <Nav.Row>
        <Nav.Column xs="6">
          {
            redigerbart &&
            <PdfLenkeListe
              dokumenter={pdfDokumenter}
              behandlingID={behandlingID}
            />
          }
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Nav.Hovedknapp disabled={!redigerbart} onClick={vedKlikkVideresend}>
            VIDERESEND SØKNAD
          </Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

VurderingVideresend.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  videresendSoknad: PT.func.isRequired,
  bostedsland: MPT.Kodeverk.isRequired,
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVideresend);
