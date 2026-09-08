import { useState, useEffect } from "react";
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
import { kontrollOperations, kontrollSelectors } from "../../../../ducks/kontroll";
import { endrePeriodeSkjema, ikkeGodkjentBegrunnelseSkjema } from "./validering/unntaksperiodeSchema";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import "../saksopplysninger.less";

function Saksopplysninger({
  match,
  behandlingID,
  redigerbart,
  sed = {},
  sedLovvalgsperiode = {},
  sedLovvalgsbestemmelse,
  vurderingBegrunnelser,
  lovvalgsperiode,
  behandlingsresultat = {},
  avklartefakta,
  oppdaterAvklartefakta,
  lastInnSaksopplysninger,
  tilForsiden,
  startOgVisOppfriskModal,
  behandlingsresultatErHentet,
  kontrollerUnntaksperiode,
  unntaksperiodeKontrollfeil,
}) {
  const [unntaksperiodeVurdering, setUnntaksperiodeVurdering] = useState(KV.Koder.Unntaksperiode.AVSLAG);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = useState("");
  const [ikkeGodkjentBegrunnelseKoder, setIkkeGodkjentBegrunnelseKoder] = useState([]);
  const [ikkeGodkjentFeilmeldinger, setIkkeGodkjentFeilmeldinger] = useState({
    begrunnelseKoder: undefined,
    begrunnelseFritekst: undefined,
  });
  const [endrePeriodeFeilmeldinger, setEndrePeriodeFeilmeldinger] = useState({
    fom: undefined,
    tom: undefined,
    fritekst: undefined,
  });
  const [endrePeriodeFom, setEndrePeriodeFom] = useState("");
  const [endrePeriodeTom, setEndrePeriodeTom] = useState("");
  const [endrePeriodeBegrunnelse, setEndrePeriodeBegrunnelse] = useState(
    MKV.Koder.begrunnelser.folketrygdloven.endret_unntaksperiode.PERIODE_FEILREGISTRERT,
  );
  const [endrePeriodeFritekst, setEndrePeriodeFritekst] = useState("");
  const [periodeOver5aarVarslet, setPeriodeOver5aarVarslet] = useState(false);
  const [durationWarningMessage, setDurationWarningMessage] = useState(null);
  const [registreringPending, setRegistreringPending] = useState(false);

  const {
    params: { saksnr: saksnummer },
  } = match;

  const [harValgtIkkeGodkjenn, setHarValgtIkkeGodkjenn] = useState(false);
  const [harUnntaksperiodefeil, setHarUnntaksperiodefeil] = useState(false);
  const [kanIkkeGodkjenneUtenÅEndrePerioden, setKanIkkeGodkjenneUtenÅEndrePerioden] = useState(false);

  useEffect(() => {
    setHarUnntaksperiodefeil(!Utils._isEmpty(unntaksperiodeKontrollfeil));
    setHarValgtIkkeGodkjenn(KV.Koder.Unntaksperiode.AVSLAG === unntaksperiodeVurdering);
  }, [unntaksperiodeVurdering, unntaksperiodeKontrollfeil]);

  useEffect(() => {
    if (!kanIkkeGodkjenneUtenÅEndrePerioden && !endrePeriodeTom && !endrePeriodeFom) {
      setKanIkkeGodkjenneUtenÅEndrePerioden(harUnntaksperiodefeil);
    }
  }, [harUnntaksperiodefeil]);

  useEffect(() => {
    if (endrePeriodeFom && endrePeriodeTom) {
      kontrollerUnntaksperiode(
        behandlingID,
        Utils.dato.formatterDatoTilISO(endrePeriodeFom, null),
        Utils.dato.formatterDatoTilISO(endrePeriodeTom, null),
      );
    }
  }, [endrePeriodeFom, endrePeriodeTom]);

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
    kontrollerUnntaksperiode(behandlingID, sedLovvalgsperiode.fom, sedLovvalgsperiode.tom);
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
      (value) => value.referanse === MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
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

  useEffect(() => {
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
      }),
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
          <Nav.Alert className="feilmelding" variant="warning">
            {durationWarningMessage}
          </Nav.Alert>
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

  const unikRadioButtonGruppeID = Utils._uuid();
  return (
    <div>
      <form name="registrering" id="registrering" onSubmit={overstyrSubmit}>
        <div className="stegvelger panelSeksjon">
          <div className="panel stegFane steg0 stegFane--aktiv">
            <Nav.Heading size="small">Registrering av unntaksperioder</Nav.Heading>
            <br />
            <div className="vurderingEndrePeriode">
              {vurderingBegrunnelser.length > 0 && (
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <>
                      <Nav.BodyLong weight="semibold" size="small">
                        Treff ved automatisk kontroll
                      </Nav.BodyLong>
                      <RegisterkontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
                    </>
                  </Nav.Column>
                </Nav.Row>
              )}
              <Nav.Row className="seksjon">
                <Nav.Column xs="12">
                  <Nav.RadioGroup
                    legend="Vurder unntaksperiode"
                    disabled={!redigerbart}
                    onChange={setUnntaksperiodeVurdering}
                    name={unikRadioButtonGruppeID}
                  >
                    <Nav.Radio
                      value={KV.Koder.Unntaksperiode.GODKJENT}
                      disabled={kanIkkeGodkjenneUtenÅEndrePerioden || !erGyldigLovvalgsperiode()}
                    >
                      Godkjenn unntaksperiode
                    </Nav.Radio>
                    <Nav.Radio value={KV.Koder.Unntaksperiode.DELVIS_GODKJENT}>Godkjenn, men endre periode</Nav.Radio>
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
                    <Nav.Radio value={KV.Koder.Unntaksperiode.AVSLAG}>Ikke godkjenn</Nav.Radio>
                  </Nav.RadioGroup>
                </Nav.Column>
              </Nav.Row>
              {unntaksperiodeVurdering === KV.Koder.Unntaksperiode.AVSLAG && behandlingsresultatErHentet && (
                <>
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
                          readOnly={!redigerbart}
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={textAreaOnChange}
                          value={begrunnelseFritekst}
                          maxLength={255}
                          error={ikkeGodkjentFeilmeldinger.begrunnelseFritekst}
                        />
                      )}
                    </Nav.Column>
                  </Nav.Row>
                </>
              )}
              {durationWarningMessage && visPeriodeVarselStripe()}
              <Nav.Row className="seksjon">
                <Nav.Column xs="3">
                  <Mui.StegKnapper
                    bekreftKnappProps={{
                      loading: registreringPending,
                      onClick: () => submitRegistrering(),
                      disabled: !harValgtIkkeGodkjenn && (!redigerbart || harUnntaksperiodefeil),
                    }}
                    bekreftTekst="Lagre"
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
}

Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  vurderingBegrunnelser: PT.arrayOf(PT.string).isRequired,
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
  kontrollerUnntaksperiode: PT.func.isRequired,
  unntaksperiodeKontrollfeil: PT.arrayOf(PT.object).isRequired,
};

const mapStateToProps = (state) => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  sedLovvalgsperiode: behandlingerSelectors.SEDSelector(state).lovvalgsperiode,
  sedLovvalgsbestemmelse: behandlingerSelectors.SEDSelector(state).lovvalgsbestemmelse,
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  behandlingsresultatErHentet: behandlingsresultatSelectors.BehandlingsresultatStatusErOkSelector(state),
  unntaksperiodeKontrollfeil: kontrollSelectors.KontrollFeilSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) =>
    dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    datalastingOperations.lastInnSaksopplysningerRegistreringUnntaksperioder(saksnummer, behandlingID)(dispatch),
  kontrollerUnntaksperiode: (behandlingID, periodeFom, periodeTom) => {
    if (periodeFom && periodeTom) {
      dispatch(kontrollOperations.kontrollerUnntaksperiode(behandlingID, { periodeFom, periodeTom }));
    }
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
