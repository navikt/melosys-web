import { useState, useEffect, Fragment } from "react";
import { withRouter } from "react-router-dom";
import PT from "prop-types";
import { connect } from "react-redux";
import * as EKV from "eessi-kodeverk";
import { v4 as uuid } from "uuid";

import MKV from "../../../../melosyskodeverk";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Api from "../../../../services/api";
import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";

import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { datalastingOperations } from "../../../../ducks/datalasting";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { anmodningsperiodesvarSelectors } from "../../../../ducks/anmodningsperiodesvar";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { anmodningunntakOperations } from "../../../../ducks/anmodningunntak";

import { RegistreringMenypanelForm } from "../../../../felleskomponenter/menypanelForm";
import RegisterkontrollTreff from "../../../../felleskomponenter/registerkontrollTreff";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste/dokumentliste";
import { Feilmeldinger } from "../../../../felleskomponenter/feilmeldinger";
import { DatoOmradeMedVarighet } from "../../../../felleskomponenter/datoOmrade";

import { delvisInnvilgelseSkjema, avslagSkjema } from "./validering/anmodningunntakSkjema";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import "../saksopplysninger.css";
import { StatsborgerskapFeil } from "../../../../felleskomponenter/alertmeldinger";

const LinkForhandsvisningSed = ({ redigerbart, behandlingID, anmodningsperiodeSvarType, vedKlikk, fritekst }) => {
  let pdfDokument = [];
  if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE) {
    pdfDokument = [{ sedType: EKV.Koder.sedtyper.A011, sedData: { fritekst } }];
  } else if (
    anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE ||
    anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG
  ) {
    pdfDokument = [{ sedType: EKV.Koder.sedtyper.A002, sedData: { fritekst } }];
  }

  return (
    redigerbart && <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokument} validateOnClick={vedKlikk} />
  );
};

LinkForhandsvisningSed.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  anmodningsperiodeSvarType: PT.string.isRequired,
  vedKlikk: PT.func.isRequired,
  fritekst: PT.string,
};

LinkForhandsvisningSed.defaultProps = {
  fritekst: null,
};

const Saksopplysninger = ({
  redigerbart,
  behandlingID,
  anmodningsperiodeID,
  anmodningsperiodeSvar,
  sed,
  vurderingBegrunnelser,
  lastInnSaksopplysninger,
  lovvalgsperiode,
  startOgVisOppfriskModal,
  saksnummer,
  sendAnmodningUnntakSvar,
}) => {
  const [anmodningsperiodeSvarType, setAnmodningsperiodeSvarType] = useState(
    MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE
  );
  const [begrunnelseFritekst, setBegrunnelseFritekst] = useState("");
  const [ytterligereInfoFritekst, setYtterligereInfoFritekst] = useState("");
  const [endretPeriodeFom, setEndretPeriodeFom] = useState("");
  const [endretPeriodeTom, setEndretPeriodeTom] = useState("");
  const [valideringFeil, setValideringFeil] = useState({ fom: undefined, tom: undefined, fritekst: undefined });
  const [periodeOver5aarVarslet, setPeriodeOver5aarVarslet] = useState(false);
  const [durationWarningMessage, setDurationWarningMessage] = useState(null);
  const [registreringPending, setRegistreringPending] = useState(false);

  const erGyldigLovvalgsperiode = () =>
    Utils.dato.erGyldigPeriode(sed?.lovvalgsperiode?.fom, sed?.lovvalgsperiode?.tom);

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
  }, [saksnummer, behandlingID]);

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
    if (!erGyldigLovvalgsperiode()) {
      setAnmodningsperiodeSvarType(MKV.Koder.anmodningsperiodesvartyper.AVSLAG);
    } else if (anmodningsperiodeSvar?.anmodningsperiodeSvarType) {
      setAnmodningsperiodeSvarType(anmodningsperiodeSvar.anmodningsperiodeSvarType);
    }
    if (anmodningsperiodeSvar?.begrunnelseFritekst) {
      setBegrunnelseFritekst(anmodningsperiodeSvar.begrunnelseFritekst);
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

    setValideringFeil(valideringsresultat);
    return Utils._isEmpty(valideringsresultat);
  };

  const overstyrSubmit = (event) => {
    event.preventDefault();
  };

  const begrunnelseTextAreaOnChange = (event) => {
    setBegrunnelseFritekst(event.target.value);
  };

  const ytterligereInfoTextAreaOnChange = (event) => {
    setYtterligereInfoFritekst(event.target.value);
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
        return makeResponse(tomPeriode);
      case DELVIS_INNVILGELSE:
        return makeResponse(
          {
            fom: Utils.dato.formatterDatoTilISO(endretPeriodeFom),
            tom: Utils.dato.formatterDatoTilISO(endretPeriodeTom),
          },
          begrunnelseFritekst
        );
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
    const varighet = Utils.dato.datoDiff(fomISO, tomISO, "years");

    if (varighet <= 0) {
      return "Ugyldig periode";
    }
    if (varighet > 5) {
      return "Perioden overstiger 5 år";
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
          <Nav.AlertStripe className="feilmelding" type="advarsel">
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

    setRegistreringPending(true);

    try {
      await Api.Anmodningsperioder.svar.send(anmodningsperiodeID, lagRequestAnmodningUnntakSvar());
      await sendAnmodningUnntakSvar(behandlingID, { ytterligereInfo: ytterligereInfoFritekst });
    } catch (e) {
      return false;
    } finally {
      setRegistreringPending(false);
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
      return false;
    }
  };

  if (!sed.lovvalgsperiode) {
    return null;
  }

  const renderBegrunnelseFritekstRow = () => (
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Textarea
          disabled={!redigerbart}
          label="Skriv begrunnelse til SED"
          onChange={begrunnelseTextAreaOnChange}
          value={begrunnelseFritekst}
          maxLength={255}
          feil={valideringFeil.fritekst}
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
  );

  const renderYtterligereInformasjonRow = () => (
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Textarea
          disabled={!redigerbart}
          label="Ytterligere informasjon til SED (valgfri)"
          onChange={ytterligereInfoTextAreaOnChange}
          value={ytterligereInfoFritekst}
          maxLength={500}
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
  );

  const renderInputfelter = (utfall) => {
    switch (utfall) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return renderYtterligereInformasjonRow();
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        return (
          <Fragment>
            <Nav.Row>
              <Nav.Column xs="3">
                <Nav.Input
                  bredde="fullbredde"
                  label="Startdato"
                  value={endretPeriodeFom}
                  onChange={(e) => oppdaterDato(e, setEndretPeriodeFom)}
                  onBlur={(e) => formaterDato(e, setEndretPeriodeFom)}
                  feil={valideringFeil.fom}
                  disabled={!redigerbart}
                />
              </Nav.Column>
              <Nav.Column xs="3">
                <Nav.Input
                  bredde="fullbredde"
                  label="Sluttdato"
                  value={endretPeriodeTom}
                  onChange={(e) => oppdaterDato(e, setEndretPeriodeTom)}
                  onBlur={(e) => formaterDato(e, setEndretPeriodeTom)}
                  feil={valideringFeil.tom}
                  disabled={!redigerbart}
                />
              </Nav.Column>
            </Nav.Row>
            {renderBegrunnelseFritekstRow()}
            {renderYtterligereInformasjonRow()}
          </Fragment>
        );
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        return (
          <Fragment>
            {renderBegrunnelseFritekstRow()}
            {renderYtterligereInformasjonRow()}
          </Fragment>
        );
      default:
        return null;
    }
  };

  const endreAnmodningsperiodeSvarType = (e) => setAnmodningsperiodeSvarType(e.target.value);

  const erGodkjent = () => MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE === anmodningsperiodeSvarType;
  const erDelvisGodkjent = () => MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE === anmodningsperiodeSvarType;
  const erIkkeGodkjent = () => MKV.Koder.anmodningsperiodesvartyper.AVSLAG === anmodningsperiodeSvarType;

  const unikRadioButtonGruppeID = uuid();

  return (
    <div>
      <Feilmeldinger />
      <StatsborgerskapFeil className="anmodningunntak_statsborgerskapmelding" />
      <form name="anmodningunntak" id="anmodningunntak" onSubmit={overstyrSubmit}>
        <div className="panelSeksjon">
          <div className="panel stegFane steg0 stegFane--aktiv">
            <Nav.Typo.Systemtittel>Vurder anmodning om unntak</Nav.Typo.Systemtittel>
            <br />
            <div className="vurderUnntaksperiode">
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.Typo.Element>Land:</Nav.Typo.Element>
                  <Nav.Typo.Normaltekst>
                    {KV.kodeTilTerm(sed.lovvalgslandKode, MKV.KTObjects.landkoder)}&nbsp;({sed.lovvalgslandKode})
                  </Nav.Typo.Normaltekst>
                </Nav.Column>
              </Nav.Row>
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <DatoOmradeMedVarighet periode={sed.lovvalgsperiode} label="Søknadsperiode" />
                </Nav.Column>
              </Nav.Row>
              {vurderingBegrunnelser.length > 0 && (
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Fragment>
                      <Nav.Typo.Element>Treff ved automatisk kontroll</Nav.Typo.Element>
                      <RegisterkontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
                    </Fragment>
                  </Nav.Column>
                </Nav.Row>
              )}
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.Fieldset legend="Vurder unntaksperiode" disabled={!redigerbart}>
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE}
                      checked={erGodkjent()}
                      onChange={endreAnmodningsperiodeSvarType}
                      label="Godkjenn unntaksperiode"
                      disabled={!erGyldigLovvalgsperiode()}
                    />
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE}
                      checked={erDelvisGodkjent()}
                      onChange={endreAnmodningsperiodeSvarType}
                      label="Godkjenn, men endre periode"
                      disabled={!erGyldigLovvalgsperiode()}
                    />
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG}
                      checked={erIkkeGodkjent()}
                      onChange={endreAnmodningsperiodeSvarType}
                      label="Ikke godkjenn"
                    />
                  </Nav.Fieldset>
                </Nav.Column>
              </Nav.Row>

              {renderInputfelter(anmodningsperiodeSvarType)}

              <Nav.Row>
                <LinkForhandsvisningSed
                  redigerbart={redigerbart}
                  behandlingID={behandlingID}
                  anmodningsperiodeSvarType={anmodningsperiodeSvarType}
                  vedKlikk={oppdaterAnmodningsperiodeSvar}
                  fritekst={ytterligereInfoFritekst}
                />
              </Nav.Row>
              {durationWarningMessage && visPeriodeVarselStripe()}
              <Nav.Row className="seksjon">
                <Nav.Column xs="3">
                  <Mui.StegKnapper
                    bekreftKnappProps={{
                      spinner: registreringPending,
                      autoDisableVedSpinner: true,
                      onClick: () => submitRegistrering(),
                      disabled: !redigerbart,
                      htmlType: "submit",
                    }}
                    bekreftTekst="Bekreft og send"
                  />
                </Nav.Column>
              </Nav.Row>
            </div>
          </div>
        </div>
      </form>
      <RegistreringMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
    </div>
  );
};

Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  vurderingBegrunnelser: PT.arrayOf(PT.string).isRequired,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  anmodningsperiodeID: PT.string,
  anmodningsperiodeSvar: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  lovvalgsperiode: MPT.Lovvalgsperiode.isRequired,
  tilForsiden: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  saksnummer: PT.string.isRequired,
  sendAnmodningUnntakSvar: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  sed: {},
  skjema: {},
  anmodningsperiodeID: undefined,
};

const mapStateToProps = (state) => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  anmodningsperiodeID: anmodningsperioderSelectors.AnmodningsperiodeIDSelector(state),
  anmodningsperiodeSvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) =>
    dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysningerBehandleMottattAOU(saksnummer, behandlingID)),
  sendAnmodningUnntakSvar: (behandlingID, svar) => dispatch(anmodningunntakOperations.svar(behandlingID, svar)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
