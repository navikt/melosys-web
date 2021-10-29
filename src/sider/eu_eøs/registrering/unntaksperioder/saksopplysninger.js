import React, { Fragment } from "react";
import { withRouter } from "react-router-dom";
import PT from "prop-types";
import { connect } from "react-redux";

import MKV from "../../../../melosyskodeverk";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Api from "../../../../services/api";
import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";

import { RegistreringMenypanelForm } from "../../../../felleskomponenter/menypanelForm";
import EndrePeriode from "./komponenter/endrePeriode";
import RegisterkontrollTreff from "../../../../felleskomponenter/registerkontrollTreff";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { datalastingOperations } from "../../../../ducks/datalasting";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { endrePeriodeSkjema, ikkeGodkjentBegrunnelseSkjema } from "./validering/unntaksperiodeSkjema";
import { lagYupToReduxformErrorMapper } from "../../../../yup";

import "../saksopplysninger.css";

const uuid = require("uuid/v4");

const Saksopplysninger = ({
  match,
  behandlingID,
  redigerbart,
  sed,
  sedLovvalgsperiode,
  sedLovvalgsbestemmelse,
  vurderingBegrunnelser,
  lovvalgsperiode,
  behandlingsresultat,
  avklartefakta,
  oppdaterAvklartefakta,
  lastInnSaksopplysninger,
  tilForsiden,
  startOgVisOppfriskModal,
  behandlingsresultatErHentet,
}) => {
  const [unntaksperiodeVurdering, setUnntaksperiodeVurdering] = React.useState(KV.Koder.Unntaksperiode.AVSLAG);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = React.useState("");
  const [ikkeGodkjentBegrunnelseKoder, setIkkeGodkjentBegrunnelseKoder] = React.useState([]);
  const [ikkeGodkjentFeilmeldinger, setIkkeGodkjentFeilmeldinger] = React.useState({
    begrunnelseKoder: undefined,
    begrunnelseFritekst: undefined,
  });
  const [endrePeriodeFeilmeldinger, setEndrePeriodeFeilmeldinger] = React.useState({
    fom: undefined,
    tom: undefined,
    fritekst: undefined,
  });
  const [endrePeriodeFom, setEndrePeriodeFom] = React.useState("");
  const [endrePeriodeTom, setEndrePeriodeTom] = React.useState("");
  const [endrePeriodeBegrunnelse, setEndrePeriodeBegrunnelse] = React.useState(
    MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.PERIODE_FEILREGISTRERT
  );
  const [endrePeriodeFritekst, setEndrePeriodeFritekst] = React.useState("");
  const [periodeOver5aarVarslet, setPeriodeOver5aarVarslet] = React.useState(false);
  const [durationWarningMessage, setDurationWarningMessage] = React.useState(null);
  const [registreringPending, setRegistreringPending] = React.useState(false);

  const {
    params: { snr: saksnummer },
  } = match;
  React.useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
  }, []);

  const erGyldigLovvalgsperiode = () =>
    !Utils._isEmpty(lovvalgsperiode)
      ? Utils.dato.erGyldigPeriode(lovvalgsperiode?.fomDato, lovvalgsperiode?.tomDato)
      : Utils.dato.erGyldigPeriode(sedLovvalgsperiode?.fom, sedLovvalgsperiode?.tom);

  const settEndretPeriodeOpplysninger = async (avklartFakta) => {
    setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.DELVIS_GODKJENT);
    setEndrePeriodeBegrunnelse(avklartFakta.fakta[0]); // Har alltid bare ett fakta i disse tilfellene
    setEndrePeriodeFritekst(avklartFakta.begrunnelseFritekst);

    if (lovvalgsperiode) {
      setEndrePeriodeFom(Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato));
      setEndrePeriodeTom(Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato));
    }
  };

  const godkjentUnntaksperiode = async () => {
    const endretPeriodeFakta = avklartefakta.find(
      (value) => value.referanse === MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE
    );
    if (endretPeriodeFakta) {
      settEndretPeriodeOpplysninger(endretPeriodeFakta);
    } else {
      setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.GODKJENT);
    }
  };

  const ikkeGodkjentUnntaksperiode = () => {
    setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.AVSLAG);
    setBegrunnelseFritekst(behandlingsresultat.begrunnelseFritekst);
    setIkkeGodkjentBegrunnelseKoder(behandlingsresultat.begrunnelseKoder);
  };

  const initialiserSkjema = () => {
    if (
      behandlingsresultat.utfallRegistreringUnntak === MKV.Koder.utfallregistreringunntak.GODKJENT &&
      erGyldigLovvalgsperiode()
    ) {
      godkjentUnntaksperiode();
    } else if (behandlingsresultat.utfallRegistreringUnntak === MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT) {
      ikkeGodkjentUnntaksperiode();
    }
  };

  React.useEffect(() => {
    initialiserSkjema();
  }, [avklartefakta, behandlingsresultat, lovvalgsperiode]);

  const overstyrSubmit = (event) => {
    event.preventDefault();
  };

  const textAreaOnChange = (event) => {
    setBegrunnelseFritekst(event.target.value);
  };

  const lagAvklartfakta = () => ({
    referanse: MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
    avklartefaktaKode: MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
    fakta: [endrePeriodeBegrunnelse],
    subjektID: null,
    begrunnelseKoder: [],
    begrunnelseFritekst: endrePeriodeFritekst || null,
  });

  const godkjenn = () =>
    Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID, {
      varsleUtland: false,
      fritekst: null,
      endretPeriode: null,
      lovvalgsbestemmelse: sedLovvalgsbestemmelse,
    });

  const delvisGodkjenn = () =>
    oppdaterAvklartefakta(behandlingID, [
      /* Har opplevd at det forsøkes å lagre 2 AARSAK_ENDRING_PERIODE-faktaer, derfor brukes filter(). */
      ...avklartefakta.filter((af) => af.referanse !== MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE),
      lagAvklartfakta(),
    ]).then(() =>
      Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID, {
        varsleUtland: false,
        fritekst: null,
        endretPeriode: {
          fom: Utils.dato.formatterDatoTilISO(endrePeriodeFom),
          tom: Utils.dato.formatterDatoTilISO(endrePeriodeTom),
        },
        lovvalgsbestemmelse: sedLovvalgsbestemmelse,
      })
    );

  const kanEndrePeriode = () => unntaksperiodeVurdering === KV.Koder.Unntaksperiode.DELVIS_GODKJENT;

  const validerEndrePeriode = () => {
    if (!kanEndrePeriode()) {
      return true;
    }

    const fritekstPakrevd =
      endrePeriodeBegrunnelse === MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.ANNET;
    const begrunnelsePakrevd = !endrePeriodeBegrunnelse;
    const settings = { context: { fritekstPakrevd, begrunnelsePakrevd } };
    const stateObject = {
      fom: endrePeriodeFom,
      tom: endrePeriodeTom,
      fritekst: endrePeriodeFritekst,
      begrunnelse: endrePeriodeBegrunnelse,
    };
    const feilmeldinger = lagYupToReduxformErrorMapper(endrePeriodeSkjema, settings)(stateObject);
    setEndrePeriodeFeilmeldinger(feilmeldinger);

    return Utils._isEmpty(feilmeldinger);
  };

  const validerAvslag = (ikkeGodkjentBegrunnelse) => {
    if (unntaksperiodeVurdering !== KV.Koder.Unntaksperiode.AVSLAG) {
      return true;
    }

    const koder = ikkeGodkjentBegrunnelse || ikkeGodkjentBegrunnelseKoder;

    const settings = { context: { fritekstPakrevd: koder.includes("ANNET") } };
    const stateObject = {
      begrunnelseKoder: koder,
      begrunnelseFritekst,
    };

    const feilmeldinger = lagYupToReduxformErrorMapper(ikkeGodkjentBegrunnelseSkjema, settings)(stateObject);
    setIkkeGodkjentFeilmeldinger(feilmeldinger);

    return Utils._isEmpty(feilmeldinger);
  };

  const validerFelt = () => validerEndrePeriode() && validerAvslag();

  const sjekkDatoVarsel = (fom, tom) => {
    if (!kanEndrePeriode()) {
      return null;
    }

    const fomISO = Utils.dato.formatterDatoTilISO(fom);
    const tomISO = Utils.dato.formatterDatoTilISO(tom);
    const varighet = Utils.dato.datoDiff(fomISO, tomISO, "years");

    if (varighet <= 0) {
      return "Ugyldig periode";
    } else if (varighet > 5) {
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

  const submitRegistrering = () => {
    if (!validerFelt()) {
      setPeriodeOver5aarVarslet(false);
      return false;
    }

    const durationWarning = sjekkDatoVarsel(endrePeriodeFom, endrePeriodeTom);
    setDurationWarningMessage(durationWarning);
    if (durationWarning) {
      if (!periodeOver5aarVarslet) {
        setPeriodeOver5aarVarslet(true);
        return false;
      }
    }

    setRegistreringPending(true);

    switch (unntaksperiodeVurdering) {
      case KV.Koder.Unntaksperiode.GODKJENT:
        godkjenn()
          .then(tilForsiden)
          .catch(() => {
            setRegistreringPending(false);
          });
        return true;
      case KV.Koder.Unntaksperiode.DELVIS_GODKJENT:
        delvisGodkjenn()
          .then(tilForsiden)
          .catch(() => {
            setRegistreringPending(false);
          });
        return true;
      case KV.Koder.Unntaksperiode.AVSLAG: {
        const ikkegodkjenn = {
          ikkeGodkjentBegrunnelseKoder: [...ikkeGodkjentBegrunnelseKoder],
          begrunnelseFritekst,
        };
        Api.Saksflyt.Unntaksperioder.ikkegodkjenn(behandlingID, { ...ikkegodkjenn })
          .then(tilForsiden)
          .catch(() => {
            setRegistreringPending(false);
          });
        return true;
      }
      default:
        return false;
    }
  };

  if (!sed.lovvalgsperiode) {
    return null;
  }

  const listevalgEndringHandler = (event) => {
    const ikkeGodkjentBegrunnelse = [...event.value];
    setIkkeGodkjentBegrunnelseKoder(ikkeGodkjentBegrunnelse);
    validerAvslag(ikkeGodkjentBegrunnelse);
  };

  const endreUnntaksperiodeVurdering = (e) => setUnntaksperiodeVurdering(e.target.value);
  const unikRadioButtonGruppeID = uuid();
  return (
    <div>
      <form name="registrering" id="registrering" onSubmit={overstyrSubmit}>
        <div className="stegvelger panelSeksjon">
          <div className="panel stegFane steg0 stegFane--aktiv">
            <Nav.Typo.Systemtittel>Registrering av unntaksperioder</Nav.Typo.Systemtittel>
            <br />
            <div className="vurderingEndrePeriode">
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
                      value={KV.Koder.Unntaksperiode.GODKJENT}
                      checked={KV.Koder.Unntaksperiode.GODKJENT === unntaksperiodeVurdering}
                      onChange={endreUnntaksperiodeVurdering}
                      disabled={!erGyldigLovvalgsperiode()}
                      label="Godkjenn unntaksperiode"
                    />
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={KV.Koder.Unntaksperiode.DELVIS_GODKJENT}
                      checked={KV.Koder.Unntaksperiode.DELVIS_GODKJENT === unntaksperiodeVurdering}
                      onChange={endreUnntaksperiodeVurdering}
                      label="Godkjenn, men endre periode"
                    />
                    {kanEndrePeriode() && (
                      <Nav.Row>
                        <EndrePeriode
                          redigerbart={redigerbart}
                          feilmeldinger={endrePeriodeFeilmeldinger}
                          sedLovvalgsperiode={sedLovvalgsperiode}
                          lovvalgsperiode={lovvalgsperiode}
                          oppdaterFom={setEndrePeriodeFom}
                          oppdaterTom={setEndrePeriodeTom}
                          oppdaterBegrunnelse={setEndrePeriodeBegrunnelse}
                          oppdaterFritekst={setEndrePeriodeFritekst}
                          endrePeriode={{
                            fom: endrePeriodeFom,
                            tom: endrePeriodeTom,
                            begrunnelse: endrePeriodeBegrunnelse,
                            fritekst: endrePeriodeFritekst,
                          }}
                        />
                      </Nav.Row>
                    )}
                    <Nav.Radio
                      name={unikRadioButtonGruppeID}
                      value={KV.Koder.Unntaksperiode.AVSLAG}
                      checked={KV.Koder.Unntaksperiode.AVSLAG === unntaksperiodeVurdering}
                      onChange={endreUnntaksperiodeVurdering}
                      label="Ikke godkjenn"
                    />
                  </Nav.Fieldset>
                </Nav.Column>
              </Nav.Row>
              {unntaksperiodeVurdering === KV.Koder.Unntaksperiode.AVSLAG && behandlingsresultatErHentet && (
                <Fragment>
                  <Nav.Row>
                    <Nav.Column xs="6">
                      <Nav.Fieldset legend="Begrunnelse for ikke godkjent unntaksperiode">
                        <Mui.ListevelgerFlervalg
                          disabled={!redigerbart}
                          muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                          label="Legg til begrunnelse for ikke oppfylt:"
                          tillatFritekst={false}
                          onChange={listevalgEndringHandler}
                          feil={ikkeGodkjentFeilmeldinger.begrunnelseKoder}
                          defaultElementer={behandlingsresultat.begrunnelseKoder}
                        />
                      </Nav.Fieldset>
                    </Nav.Column>
                  </Nav.Row>
                  <Nav.Row>
                    <Nav.Column xs="6">
                      {ikkeGodkjentBegrunnelseKoder.includes("ANNET") && (
                        <Nav.Textarea
                          disabled={!redigerbart}
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={textAreaOnChange}
                          value={begrunnelseFritekst}
                          maxLength={255}
                          feil={ikkeGodkjentFeilmeldinger.begrunnelseFritekst}
                          bredde="fullbredde"
                        />
                      )}
                    </Nav.Column>
                  </Nav.Row>
                </Fragment>
              )}
              {durationWarningMessage && visPeriodeVarselStripe()}
              <Nav.Row className="seksjon">
                <Nav.Column xs="3">
                  <Nav.Hovedknapp
                    spinner={registreringPending}
                    autoDisableVedSpinner
                    onClick={() => submitRegistrering()}
                    disabled={!redigerbart}
                  >
                    LAGRE
                  </Nav.Hovedknapp>
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
  lovvalgsperiode: PT.object.isRequired,
  sedLovvalgsperiode: MPT.Periode,
  sedLovvalgsbestemmelse: PT.string.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  behandlingsresultat: PT.object,
  tilForsiden: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  behandlingsresultatErHentet: PT.bool.isRequired,
};

Saksopplysninger.defaultProps = {
  sed: {},
  skjema: {},
  sedLovvalgsperiode: {},
  behandlingsresultat: {},
};

const mapStateToProps = (state) => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  sedLovvalgsperiode: behandlingerSelectors.SEDSelector(state).lovvalgsperiode,
  sedLovvalgsbestemmelse: behandlingerSelectors.SEDSelector(state).lovvalgsbestemmelse,
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  behandlingsresultatErHentet: behandlingsresultatSelectors.BehandlingsresultatStatusErOkSelector(state),
});
const mapDispatchToProps = (dispatch) => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) =>
    dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    datalastingOperations.lastInnSaksopplysningerSedBehandling(saksnummer, behandlingID)(dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
