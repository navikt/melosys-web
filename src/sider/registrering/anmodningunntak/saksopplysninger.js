import React, { useState, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';

import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';
import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';

import Paneler from './komponenter/paneler';
import RegisterkontrollTreff from '../../../felleskomponenter/registerkontrollTreff';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { datalastingOperations } from '../../../ducks/datalasting';
import { anmodningsperioderSelectors } from '../../../ducks/anmodningsperioder';
import { anmodningsperiodesvarSelectors } from '../../../ducks/anmodningsperiodesvar';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

import '../saksopplysninger.css';
import { DatoOmradeMedVarighet } from '../../../felleskomponenter/datoOmrade/datoOmrade';
import { lagYupToReduxformErrorMapper } from '../../../felleskomponenter/skjema/validering/skjemaer';
import { delvisInnvilgelseSkjema, avslagSkjema } from './validering/anmodningunntakSkjema';
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

const Saksopplysninger = ({
  history,
  redigerbart,
  behandlingID,
  anmodningsperiodeID,
  anmodningsperiodeSvar,
  medlemskap,
  sed,
  vurderingBegrunnelser,
  lastInnSaksopplysninger,
  lovvalgsperiode,
}) => {
  const [anmodningsperiodeSvarType, setAnmodningsperiodeSvarType] = useState(MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = useState('');
  const [endretPeriodeFom, setEndretPeriodeFom] = useState('');
  const [endretPeriodeTom, setEndretPeriodeTom] = useState('');
  const [feilmeldinger, setFeilmeldinger] = useState({ fom: undefined, tom: undefined, fritekst: undefined });
  const [periodeOver5aarVarslet, setPeriodeOver5aarVarslet] = useState(false);
  const [durationWarningMessage, setDurationWarningMessage] = useState(null);

  useEffect(() => {
    lastInnSaksopplysninger(behandlingID, anmodningsperiodeID);
  }, [anmodningsperiodeID]);

  const setEndretPeriode = () => {
    if (sed.lovvalgsperiode) {
      setEndretPeriodeFom(Utils.dato.formatterDatoTilNorsk(sed.lovvalgsperiode.fom));
      setEndretPeriodeTom(Utils.dato.formatterDatoTilNorsk(sed.lovvalgsperiode.tom));
    }
    if (anmodningsperiodeSvar.endretPeriode) {
      setEndretPeriodeFom(Utils.dato.formatterDatoTilNorsk(anmodningsperiodeSvar.endretPeriode.fom));
      setEndretPeriodeTom(Utils.dato.formatterDatoTilNorsk(anmodningsperiodeSvar.endretPeriode.tom));
    }
    if (lovvalgsperiode.tomDato) {
      setEndretPeriodeTom(Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato));
    }
  };

  const initialiserSkjema = () => {
    if (anmodningsperiodeSvar) {
      if (anmodningsperiodeSvar.anmodningsperiodeSvarType) {
        setAnmodningsperiodeSvarType(anmodningsperiodeSvar.anmodningsperiodeSvarType);
      }
      if (anmodningsperiodeSvar.begrunnelseFritekst) {
        setBegrunnelseFritekst(anmodningsperiodeSvar.begrunnelseFritekst);
      }
    }
  };

  useEffect(() => {
    initialiserSkjema();
  }, [anmodningsperiodeSvar]);

  useEffect(() => {
    setEndretPeriode();
  }, [sed.lovvalgsperiode, anmodningsperiodeSvar.endretPeriode, lovvalgsperiode.tomDato]);

  const validerFelt = () => {
    let valideringsresultat;
    switch (anmodningsperiodeSvarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return true;
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        valideringsresultat = lagYupToReduxformErrorMapper(delvisInnvilgelseSkjema)({
          fom: endretPeriodeFom,
          tom: endretPeriodeTom,
          fritekst: begrunnelseFritekst,
        });
        break;
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        valideringsresultat = lagYupToReduxformErrorMapper(avslagSkjema)({ fritekst: begrunnelseFritekst });
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
        }, begrunnelseFritekst);
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

    const tilForsiden = () => history.push('/');
    try {
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
            <Nav.typo.Systemtittel>Behandle anmodning om unntak</Nav.typo.Systemtittel>
            <br />
            <div className="vurderUnntaksperiode">
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.typo.Element>Land:</Nav.typo.Element>
                  <Nav.typo.Normaltekst>{KV.kodeTilTerm(sed.lovvalgslandKode, MKV.KTObjects.landkoder)}&nbsp;({sed.lovvalgslandKode})</Nav.typo.Normaltekst>
                </Nav.Column>
              </Nav.Row>
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <DatoOmradeMedVarighet periode={sed.lovvalgsperiode} label="Søknadsperiode" />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  {
                    vurderingBegrunnelser.length > 0 &&
                    <Fragment>
                      <Nav.typo.Element>Treff ved automatisk kontroll</Nav.typo.Element>
                      <RegisterkontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
                    </Fragment>
                  }
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
                      <Fragment>
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
                        <Nav.Row>
                          <Nav.Column xs="6">
                            <Nav.Textarea
                              disabled={!redigerbart}
                              label="Skriv inn begrunnelse for delvis innvilgelse..."
                              onChange={textAreaOnChange}
                              value={begrunnelseFritekst}
                              maxLength={255}
                              feil={feilmeldinger.fritekst}
                              bredde="fullbredde" />
                          </Nav.Column>
                        </Nav.Row>
                      </Fragment>
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
              )}
              <Nav.Row>
                <LinkForhandsvisningSed
                  redigerbart={redigerbart}
                  behandlingID={behandlingID}
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
      <Paneler medlemskap={medlemskap} />
    </div>
  );
};

Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  vurderingBegrunnelser: PT.arrayOf(PT.string).isRequired,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  anmodningsperiodeID: PT.string,
  anmodningsperiodeSvar: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  lovvalgsperiode: MPT.Lovvalgsperiode.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  sed: {},
  skjema: {},
  anmodningsperiodeID: undefined,
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  anmodningsperiodeID: anmodningsperioderSelectors.AnmodningsperiodeIDSelector(state),
  anmodningsperiodeSvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  lastInnSaksopplysninger: (behandlingID, anmodningsperiodeID) => datalastingOperations.lastInnSaksopplysningerBehandleMottattAOU(behandlingID, anmodningsperiodeID)(dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
