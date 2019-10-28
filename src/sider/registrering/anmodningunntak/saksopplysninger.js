import React, { useState, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';
import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as RegistreringContext from '../state/registreringContext';
import Medlemskap from '../../../felleskomponenter/medlemskap';
import RegisterkontrollTreff from '../komponenter/registerkontrollTreff';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';

import '../saksopplysninger.css';
import { DatoOmradeMedVarighet } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import { lagYupToReduxformErrorMapper } from '../../../felleskomponenter/skjema/validering/skjemaer';
import { fritekstPakrevdSkjema, endrePeriodeSkjema } from './validering/anmodningunntakSkjema';
import PdfLenkeListe from '../../../felleskomponenter/pdfLenkeListe';

const uuid = require('uuid/v4');

const LinkForhandsvisningSed = ({
  redigerbart, behandlingID, anmodningsperiodeSvarType, vedKlikk,
}) => {
  let pdfDokument = [];
  if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE) {
    pdfDokument = [{ navn: 'Forhåndsvis SED A011', type: EKV.Koder.sedtyper.A011, erSed: true }];
  } else if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE
    || anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG) {
    pdfDokument = [{ navn: 'Forhåndsvis SED A002', type: EKV.Koder.sedtyper.A002, erSed: true }];
  }

  return redigerbart && <PdfLenkeListe vedKlikk={vedKlikk} behandlingID={behandlingID} dokumenter={pdfDokument} />;
};

LinkForhandsvisningSed.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  anmodningsperiodeSvarType: PT.string.isRequired,
  vedKlikk: PT.func.isRequired,
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
  const [periodeOver5aarVarslet, setPeriodeOver5aarVarslet] = useState(false);
  const [durationWarningMessage, setDurationWarningMessage] = useState(null);

  useEffect(() => {
    if (props.sed.lovvalgsperiode) {
      setEndretPeriodeFom(`${Utils.dato.formatterDatoTilNorsk(props.sed.lovvalgsperiode.fom)}`);
      setEndretPeriodeTom(`${Utils.dato.formatterDatoTilNorsk(props.sed.lovvalgsperiode.tom)}`);
    }
  }, [props]);

  const hentAnmodningsperiodeId = async behandlingID => {
    const data = await Api.Anmodningsperioder.hent(behandlingID);
    const { anmodningsperioder } = data;
    return anmodningsperioder[0].id;
  };

  const hentAnmodningsperiodeSvar = async () => {
    try {
      const anmodningsperiodeId = await hentAnmodningsperiodeId(props.behandlingID);
      const anmodningsperiodeSvar = await Api.Anmodningsperioder.svar.hent(anmodningsperiodeId);

      if (anmodningsperiodeSvar) {
        if (anmodningsperiodeSvar.anmodningsperiodeSvarType) {
          setAnmodningsperiodeSvarType(anmodningsperiodeSvar.anmodningsperiodeSvarType);
        }
        if (anmodningsperiodeSvar.begrunnelseFritekst) {
          setBegrunnelseFritekst(anmodningsperiodeSvar.begrunnelseFritekst);
        }
        if (anmodningsperiodeSvar.endretPeriode) {
          setEndretPeriodeFom(`${Utils.dato.formatterDatoTilNorsk(anmodningsperiodeSvar.endretPeriode.fom)}`);
          setEndretPeriodeTom(`${Utils.dato.formatterDatoTilNorsk(anmodningsperiodeSvar.endretPeriode.tom)}`);
        }
      }
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  useEffect(() => {
    hentAnmodningsperiodeSvar();
  }, []);

  const validerFelt = () => {
    let valideringsresultat;
    switch (anmodningsperiodeSvarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return true;
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        valideringsresultat = lagYupToReduxformErrorMapper(endrePeriodeSkjema)({ fom: endretPeriodeFom, tom: endretPeriodeTom });
        break;
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        valideringsresultat = lagYupToReduxformErrorMapper(fritekstPakrevdSkjema)({ fritekst: begrunnelseFritekst });
        break;
      default:
        return false;
    }

    setFeilmeldinger(valideringsresultat);
    return Utils._isEmpty(valideringsresultat);
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

  const lagRequestAnmodningUnntakSvar = () => {
    const { INNVILGELSE, DELVIS_INNVILGELSE, AVSLAG } = MKV.Koder.anmodningsperiodesvartyper;
    const tomPeriode = { fom: null, tom: null };

    switch (anmodningsperiodeSvarType) {
      case INNVILGELSE:
        return makeResponse(tomPeriode, null);
      case DELVIS_INNVILGELSE:
        return makeResponse({
          fom: Utils.dato.formatterDatoTilISO(endretPeriodeFom),
          tom: Utils.dato.formatterDatoTilISO(endretPeriodeTom),
        }, null);
      case AVSLAG:
        return makeResponse(tomPeriode, begrunnelseFritekst);
      default:
        return null;
    }
  };

  const sjekkDatoVarsel = (fom, tom) => {
    if (anmodningsperiodeSvarType !== MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE) {
      return null;
    }

    const fomISO = Utils.dato.formatterDatoTilISO(fom);
    const tomISO = Utils.dato.formatterDatoTilISO(tom);
    const varighet = Utils.dato.datoDiff(fomISO, tomISO, 'years');

    if (varighet <= 0) {
      return 'Ugyldig periode';
    } else if (varighet > 5) {
      return 'Perioden overstiger 5 år';
    }
    return null;
  };

  const visPeriodeVarselStripe = () => {
    if (!durationWarningMessage) {
      return null;
    }
    return (
      <Nav.Row className="seksjon">
        <Nav.Column xs="8">
          <Nav.AlertStripe className="feilmelding" type="advarsel" >
            {durationWarningMessage}
          </Nav.AlertStripe>
        </Nav.Column>
      </Nav.Row>
    );
  };

  const submitRegistrering = async () => {
    if (!validerFelt()) {
      setPeriodeOver5aarVarslet(false);
      return false;
    }

    const durationWarning = sjekkDatoVarsel(endretPeriodeFom, endretPeriodeTom);
    setDurationWarningMessage(durationWarning);
    if (durationWarning) {
      if (!periodeOver5aarVarslet) {
        setPeriodeOver5aarVarslet(true);
        return false;
      }
    }

    const { behandlingID, history } = props;
    const tilForsiden = () => history.push('/');
    try {
      const anmodningsperiodeID = await hentAnmodningsperiodeId(behandlingID);
      await Api.Anmodningsperioder.svar.send(anmodningsperiodeID, lagRequestAnmodningUnntakSvar());
      await Api.Saksflyt.Anmodningsperioder.svar(behandlingID);
    } catch (e) {
      Utils.logger.error(e);
      return false;
    } finally {
      tilForsiden();
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

  const oppdaterAnmodningsperiodeSvar = async () => {
    if (!validerFelt()) {
      return false;
    }

    try {
      const anmodningsperiodeID = await hentAnmodningsperiodeId(props.behandlingID);
      await Api.Anmodningsperioder.svar.send(anmodningsperiodeID, lagRequestAnmodningUnntakSvar());
      return true;
    } catch (e) {
      Utils.logger.error(e);
      return false;
    }
  };

  if (!sed.lovvalgsperiode) {
    return null;
  }

  const endreAnmodningsperiodeSvarType = e => setAnmodningsperiodeSvarType(e.target.value);

  const unikRadioButtonGruppeID = uuid();

  return (
    <div>
      <form name="anmodningunntak" id="anmodningunntak" onSubmit={overstyrSubmit}>
        <div className="stegvelger panelSeksjon">
          <div className="panel stegFane steg0 stegFane--aktiv">
            <Nav.Systemtittel>Behandle anmodning om unntak</Nav.Systemtittel>
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
                  <Nav.Fieldset legend="Vurder unntaksperiode" disabled={!redigerbart}>
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE}
                      checked={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE === anmodningsperiodeSvarType}
                      onChange={endreAnmodningsperiodeSvarType}
                      label="Godkjenn unntaksperiode"
                    />
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE}
                      checked={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE === anmodningsperiodeSvarType}
                      onChange={endreAnmodningsperiodeSvarType}
                      label="Godkjenn, men endre periode"
                    />
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
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG}
                      checked={MKV.Koder.anmodningsperiodesvartyper.AVSLAG === anmodningsperiodeSvarType}
                      onChange={endreAnmodningsperiodeSvarType}
                      label="Ikke godkjenn"
                    />
                  </Nav.Fieldset>
                </Nav.Column>
              </Nav.Row>
              {anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG && (
                <Fragment>
                  <Nav.Row>
                    <Nav.Column xs="6">
                      <Nav.Textarea
                        disabled={!redigerbart}
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
              <Nav.Row>
                <LinkForhandsvisningSed
                  redigerbart={redigerbart}
                  behandlingID={props.behandlingID}
                  anmodningsperiodeSvarType={anmodningsperiodeSvarType}
                  vedKlikk={oppdaterAnmodningsperiodeSvar}
                />
              </Nav.Row>
              {durationWarningMessage && visPeriodeVarselStripe()}
              <Nav.Row className="seksjon">
                <Nav.Column xs="3">
                  <Nav.Hovedknapp onClick={() => submitRegistrering()} disabled={!redigerbart}>Bekreft og send</Nav.Hovedknapp>
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
