import React, { useState, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import * as RegistreringContext from '../../state/registreringContext';
import Medlemskap from '../../../../felleskomponenter/medlemskap';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../../ducks/avklartefakta';

import './saksopplysninger.css';
import { DatoOmradeMedVarighet } from '../../../../felleskomponenter/datoOmrade/datoOmrade';
import { createValidator } from '../../../../felleskomponenter/skjema/validering/skjemaer';
import { endrePeriodeSkjema } from '../../unntaksperioder/validering/endrePeriodeSkjema';
import { fritekstPakrevdSkjema } from '../validering/anmodningunntakSkjema';

const uuid = require('uuid/v4');

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.unntak_periode_begrunnelser);
};

const RegisterkontrollTreff = ({ begrunnelseKode }) => (
  <div className="registerkontroll-listeelement">
    <Nav.Ikoner kind="advarsel-sirkel-fyll" size="24" />
    <Nav.Normaltekst>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.Normaltekst>
  </div>
);

RegisterkontrollTreff.propTypes = {
  begrunnelseKode: PT.string.isRequired,
};

const Saksopplysninger = props => {
  const {
    medlemskap, sed, vurderingBegrunnelser, redigerbart,
  } = props;

  const [anmodningsperiodeSvarType, setAnmodningsperiodeSvarType] = useState(MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = useState('');
  const [endretPeriodeFom, setEndretPeriodeFom] = useState('');
  const [endretPeriodeTom, setEndretPeriodeTom] = useState('');
  const [feilmeldinger, setFeilmeldinger] = useState({ fom: undefined, tom: undefined, fritekst: undefined });

  useEffect(() => {
    if (props.sed.lovvalgsperiode) {
      setEndretPeriodeFom(`${Utils.dato.formatterDatoTilNorsk(props.sed.lovvalgsperiode.fom)}`);
      setEndretPeriodeTom(`${Utils.dato.formatterDatoTilNorsk(props.sed.lovvalgsperiode.tom)}`);
    }
  }, [props]);

  const validerFelt = () => {
    let valideringsresultat;
    switch (anmodningsperiodeSvarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return true;
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        valideringsresultat = createValidator(endrePeriodeSkjema)({ fom: endretPeriodeFom, tom: endretPeriodeTom });
        break;
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        valideringsresultat = createValidator(fritekstPakrevdSkjema)({ fritekst: begrunnelseFritekst });
        break;
      default:
        return false;
    }

    const validert = Utils._isEmpty(valideringsresultat);
    if (!validert) {
      setFeilmeldinger(valideringsresultat);
    }
    return validert;
  };

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const textAreaOnChange = event => {
    setBegrunnelseFritekst(event.target.value);
  };

  const makeResponse = (endretPeriode = null, fritekst = null) => ({
    anmodningsperiodeSvarType,
    endretPeriode,
    begrunnelseFritekst: fritekst,
  });

  const submitRegistrering = async () => {
    if (validerFelt()) {
      const { behandlingID, history } = props;
      const tilForsiden = () => history.push('/');
      const { INNVILGELSE, DELVIS_INNVILGELSE, AVSLAG } = MKV.Koder.anmodningsperiodesvartyper;
      let response;
      switch (anmodningsperiodeSvarType) {
        case INNVILGELSE:
          response = makeResponse(null, null);
          break;
        case DELVIS_INNVILGELSE:
          response = makeResponse({
            fom: Utils.dato.formatterDatoTilISO(endretPeriodeFom),
            tom: Utils.dato.formatterDatoTilISO(endretPeriodeTom),
          }, null);
          break;
        case AVSLAG:
          response = makeResponse(null, begrunnelseFritekst);
          break;
        default:
          break;
      }
      try {
        const data = await Api.Anmodningsperioder.hent(behandlingID);
        const { anmodningsperioder } = data;
        const anmodningsperiodeID = anmodningsperioder[0].id;
        await Api.Anmodningsperioder.svar.send(anmodningsperiodeID, response);
        await Api.Saksflyt.Anmodningsperioder.svar(behandlingID);
      } catch (e) {
        Utils.logger.error(e);
        return false;
      } finally {
        tilForsiden();
      }
    }
    return true;
  };

  const formaterDato = (event, oppdater) => {
    const nyDato = Utils.dato.vaskInputDato(event.target.value);
    if (nyDato) {
      oppdater(nyDato);
    }
  };

  const oppdaterDato = (event, oppdater) => {
    event.stopPropagation();
    oppdater(event.target.value);
  };

  if (!sed.lovvalgsperiode) {
    return null;
  }

  const unikRadioButtonGruppeID = uuid();

  return (
    <div>
      <form name="anmodningunntak" id="anmodningunntak" onSubmit={overstyrSubmit}>
        <div className="stegvelger panelSeksjon">
          <div className="panel stegFane steg0 stegFane--aktiv">
            <Nav.Systemtittel>Behandle anmoding om unntak</Nav.Systemtittel>
            <br />
            <div className="vurderUnntaksperiode">
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.Element>Land:</Nav.Element>
                  <Nav.Normaltekst>{KV.kodeTilTerm(sed.lovvalgslandKode, MKV.KTObjects.landkoder)}&nbsp;({sed.lovvalgslandKode})</Nav.Normaltekst>
                </Nav.Column>
              </Nav.Row>
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <DatoOmradeMedVarighet periode={sed.lovvalgsperiode} label="Søknadsperiode" />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.Element>Treff ved automatisk kontroll</Nav.Element>
                  {vurderingBegrunnelser.begrunnelseKoder && vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode =>
                    <RegisterkontrollTreff key={uuid()} begrunnelseKode={begrunnelseKode} />)}
                </Nav.Column>
              </Nav.Row>
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.Fieldset legend="Vurder unntaksperiode" onChange={e => setAnmodningsperiodeSvarType(e.target.value)} disabled={!redigerbart}>
                    <Nav.Radio name={unikRadioButtonGruppeID} value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE} label={MKV.Terms.anmodningsperiodesvartyper.INNVILGELSE} defaultChecked />
                    <Nav.Radio name={unikRadioButtonGruppeID} value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} label={MKV.Terms.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} />
                    {anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE && (
                      <Nav.Row>
                        <Nav.Column xs="3">
                          <Nav.Input
                            bredde="fullbredde"
                            label="Startdato"
                            value={endretPeriodeFom}
                            onChange={e => oppdaterDato(e, setEndretPeriodeFom)}
                            onBlur={e => formaterDato(e, setEndretPeriodeFom)}
                            feil={feilmeldinger.fom}
                            disabled={!redigerbart} />
                        </Nav.Column>
                        <Nav.Column xs="3">
                          <Nav.Input
                            bredde="fullbredde"
                            label="Sluttdato"
                            value={endretPeriodeTom}
                            onChange={e => oppdaterDato(e, setEndretPeriodeTom)}
                            onBlur={e => formaterDato(e, setEndretPeriodeTom)}
                            feil={feilmeldinger.tom}
                            disabled={!redigerbart} />
                        </Nav.Column>
                      </Nav.Row>
                    )}
                    <Nav.Radio name={unikRadioButtonGruppeID} value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} label={MKV.Terms.anmodningsperiodesvartyper.AVSLAG} />
                  </Nav.Fieldset>
                </Nav.Column>
              </Nav.Row>
              {anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG && (
                <Fragment>
                  <Nav.Row>
                    <Nav.Column xs="6">
                      <Nav.Textarea
                        label="Skriv inn begrunnelse for avslaget..."
                        onChange={textAreaOnChange}
                        value={begrunnelseFritekst}
                        maxLength={255}
                        feil={feilmeldinger.fritekst}
                        bredde="fullbredde" />
                    </Nav.Column>
                  </Nav.Row>
                </Fragment>
              )}
              <Nav.Row className="seksjon">
                <Nav.Column xs="3">
                  <Nav.Hovedknapp onClick={() => submitRegistrering()} disabled={!redigerbart}>Bekreft og fortsett</Nav.Hovedknapp>
                </Nav.Column>
              </Nav.Row>
            </div>
          </div>
        </div>
      </form>
      {medlemskap && <Medlemskap medlemskap={medlemskap} />}
    </div>
  );
};


Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
