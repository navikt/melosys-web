import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useParams } from "react-router";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import MKV from "../../../../melosyskodeverk";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Api from "../../../../services/api";
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
import { Avklartfakta } from "../../../../services/modules/avklartefakta";
import { Lovvalgsperiode } from "../../../../services/modules/lovvalgsperioder";
import "../saksopplysninger.less";

interface SedLovvalgsperiode {
  fom?: string;
  tom?: string;
}

interface Behandlingsresultat {
  utfallRegistreringUnntak?: string;
  begrunnelseKoder?: string[];
  begrunnelseFritekst?: string;
}

interface Feilmeldinger {
  [felt: string]: string | undefined;
}

const mapStateToProps = (state: RootState) => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state) as Avklartfakta[],
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state) as Partial<Lovvalgsperiode>,
  sedLovvalgsperiode: behandlingerSelectors.SEDSelector(state).lovvalgsperiode as SedLovvalgsperiode | undefined,
  sedLovvalgsbestemmelse: behandlingerSelectors.SEDSelector(state).lovvalgsbestemmelse as string,
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state) as Behandlingsresultat,
  behandlingsresultatErHentet: behandlingsresultatSelectors.BehandlingsresultatStatusErOkSelector(state) as boolean,
  unntaksperiodeKontrollfeil: kontrollSelectors.KontrollFeilSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterAvklartefakta: (behandlingID: number, avklartefaktaListe: Avklartfakta[]) =>
    dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
  lastInnSaksopplysninger: (saksnummer: string | undefined, behandlingID: number) =>
    datalastingOperations.lastInnSaksopplysningerRegistreringUnntaksperioder(saksnummer, behandlingID)(dispatch),
  kontrollerUnntaksperiode: (behandlingID: number, periodeFom?: string | null, periodeTom?: string | null) => {
    if (periodeFom && periodeTom) {
      dispatch(kontrollOperations.kontrollerUnntaksperiode(behandlingID, { periodeFom, periodeTom }));
    }
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

interface SaksopplysningerProps extends ConnectedProps<typeof connector> {
  behandlingID: number;
  redigerbart: boolean;
  sed?: { lovvalgsperiode?: SedLovvalgsperiode };
  vurderingBegrunnelser: string[];
  tilForsiden: () => void;
  startOgVisOppfriskModal: () => void;
}

function Saksopplysninger({
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
}: SaksopplysningerProps) {
  const [unntaksperiodeVurdering, setUnntaksperiodeVurdering] = useState<string | null>(null);
  const [begrunnelseFritekst, setBegrunnelseFritekst] = useState("");
  const [ikkeGodkjentBegrunnelseKoder, setIkkeGodkjentBegrunnelseKoder] = useState<string[]>([]);
  const [ikkeGodkjentFeilmeldinger, setIkkeGodkjentFeilmeldinger] = useState<Feilmeldinger>({
    begrunnelseKoder: undefined,
    begrunnelseFritekst: undefined,
  });
  const [endrePeriodeFeilmeldinger, setEndrePeriodeFeilmeldinger] = useState<Feilmeldinger>({
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
  const [durationWarningMessage, setDurationWarningMessage] = useState<string | null>(null);
  const [registreringPending, setRegistreringPending] = useState(false);

  const { saksnr: saksnummer } = useParams();

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
  const settEndretPeriodeOpplysninger = async (avklartFakta: Avklartfakta) => {
    setUnntaksperiodeVurdering(KV.Koder.Unntaksperiode.DELVIS_GODKJENT);
    setEndrePeriodeBegrunnelse(avklartFakta.fakta[0]); // Har alltid bare ett fakta i disse tilfellene
    setEndrePeriodeFritekst(avklartFakta.begrunnelseFritekst ?? "");

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
    setBegrunnelseFritekst(behandlingsresultat.begrunnelseFritekst ?? "");
    setIkkeGodkjentBegrunnelseKoder(behandlingsresultat.begrunnelseKoder ?? []);
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

  const overstyrSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  const textAreaOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBegrunnelseFritekst(event.target.value);
    if (ikkeGodkjentFeilmeldinger.begrunnelseFritekst) {
      validerAvslag(ikkeGodkjentBegrunnelseKoder, event.target.value);
    }
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
          fom: Utils.dato.formatterDatoTilISO(endrePeriodeFom) as string,
          tom: Utils.dato.formatterDatoTilISO(endrePeriodeTom) as string,
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
    const feilmeldinger = lagYupToReduxformErrorMapper(endrePeriodeSkjema, settings)(stateObject) as Feilmeldinger;
    setEndrePeriodeFeilmeldinger(feilmeldinger);

    return Utils._isEmpty(feilmeldinger);
  };

  const validerAvslag = (ikkeGodkjentBegrunnelse?: string[], fritekst = begrunnelseFritekst) => {
    if (unntaksperiodeVurdering !== KV.Koder.Unntaksperiode.AVSLAG) {
      return true;
    }

    const koder = ikkeGodkjentBegrunnelse || ikkeGodkjentBegrunnelseKoder;

    const settings = { context: { fritekstPakrevd: koder.includes("ANNET") } };
    const stateObject = {
      begrunnelseKoder: koder,
      begrunnelseFritekst: fritekst,
    };

    const feilmeldinger = lagYupToReduxformErrorMapper(
      ikkeGodkjentBegrunnelseSkjema,
      settings,
    )(stateObject) as Feilmeldinger;
    setIkkeGodkjentFeilmeldinger(feilmeldinger);

    return Utils._isEmpty(feilmeldinger);
  };

  const validerFelt = () => validerEndrePeriode() && validerAvslag();

  const sjekkDatoVarsel = (fom: string, tom: string) => {
    if (!kanEndrePeriode()) {
      return null;
    }

    const fomISO = Utils.dato.formatterDatoTilISO(fom);
    const tomISO = Utils.dato.formatterDatoTilISO(tom);
    const varighet = Number(Utils.dato.datoDiff(fomISO, tomISO, "years"));

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
          begrunnelseFritekst: ikkeGodkjentBegrunnelseKoder.includes("ANNET") ? begrunnelseFritekst : "",
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

  const begrunnelseEndringHandler = (ikkeGodkjentBegrunnelse: string[]) => {
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
                    value={unntaksperiodeVurdering}
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
                      <Mui.KodeTermCheckboxGroup
                        disabled={!redigerbart}
                        muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                        legend="Begrunnelse for ikke godkjent unntaksperiode"
                        onChange={begrunnelseEndringHandler}
                        error={ikkeGodkjentFeilmeldinger.begrunnelseKoder}
                        defaultValg={behandlingsresultat.begrunnelseKoder}
                      />
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
                      disabled:
                        !unntaksperiodeVurdering || (!harValgtIkkeGodkjenn && (!redigerbart || harUnntaksperiodefeil)),
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

export default connector(Saksopplysninger);
