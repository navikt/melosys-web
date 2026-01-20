import { useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch } from "react-redux";
import { getFormSyncErrors, getFormValues, InjectedFormProps, reduxForm } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Skjema from "../../felleskomponenter/skjema";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";

import { landkoderOperations, landkoderSelectors } from "../../ducks/landkoder";
import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { sokOperations, sokSelectors } from "../../ducks/sok";
import { fagsakOperations } from "../../ducks/fagsaker";

import Knapperad from "../../felleskomponenter/knapperad";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import { hentSammensattNavn } from "../../graphql/navn";
import { FagsakVelger } from "../../felleskomponenter/fagsakVelger";
import { skalViseSoknadsperiodeOgLand } from "../../felleskomponenter/fagsakVelger/opprettSak";

import IdentOgNavn from "./komponenter/identOgNavn";

import { lagYupToReduxformErrorMapper } from "../../yup";
import opprettNySakSchema from "./opprettnysakSchema";
import "./opprettnysak.less";
import { Spinner } from "../../felleskomponenter/spinner";
import { HStack } from "@navikt/ds-react";
import { EnkelNavBox } from "../../felleskomponenter/enkelNavBox";
import { oppgaverOperations } from "../../ducks/oppgaver";
import { OpprettNyOppgave } from "./komponenter/opprettNyOppgave";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

export interface OpprettNySakFormData {
  behandlingstema: string;
  behandlingstype: string;
  periodeFraOgMed: string;
  periodeTilOgMed: string;
  soknadslandFlereLandUkjentHvilke: boolean;
  soknadsland: [];
  opprettBehandling: boolean;
  saksnummer: string;
  sakstype: string;
  sakstema: string;
  brukerID: string;
  skalTilordnes: boolean;
  hovedpart: string;
  brukerNavn: string;
  virksomhetOrgnr: string;
  virksomhetNavn: string;
  mottaksdato: string;
  behandlingsaarsakType: string;
  behandlingsaarsakFritekst?: string;
}

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.OPPRETT_NY_SAK)(state) as OpprettNySakFormData,
  errors: getFormSyncErrors(KV.Form.OPPRETT_NY_SAK)(state),
  fagsakListe: sokSelectors.FagsakSokSelector(state),
  initialValues: {
    skalTilordnes: false,
    hovedpart: BRUKER,
    opprettBehandling: true,
    mottaksdato: Utils.dato.dateTilNorskString(new Date()),
  },
  landkoderListe: landkoderSelectors.LandkoderSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  lagNySak: (body: Api.Fagsaker.fagsak.OpprettReqDto) => dispatch(fagsakOperations.lagNySak(body)),
  lagNyBehandlingForSak: (saksnummer: string, body: Api.Fagsaker.fagsak.OpprettReqDto) =>
    dispatch(fagsakOperations.lagNyBehandlingForSak(saksnummer, body)),
  hentFagsakListe: (fnrEllerOrgnr: string) => dispatch(sokOperations.sok(fnrEllerOrgnr)),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  sokOrgnr: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type OpprettNySakProps = {
  tilForsiden: () => void;
} & PropsFromRedux;

function OpprettNySak({
  formValues,
  tilForsiden,
  change,
  touch,
  errors,
  lagNySak,
  lagNyBehandlingForSak,
  hentFagsakListe,
  fagsakListe,
  sokOrgnr,
  hentLandkoder,
  landkoderListe,
}: InjectedFormProps<OpprettNySakFormData, OpprettNySakProps> & OpprettNySakProps) {
  const [bekreftPending, setBekreftPending] = useState(false);
  const [visFeilmeldinger, setVisFeilmeldinger] = useState(false);
  const [fagsakerOgOppgaverHentes, setFagsakerOgOppgaverHentes] = useState(false);
  const dispatch = useDispatch();
  const {
    behandlingstema,
    behandlingstype,
    sakstype,
    sakstema,
    hovedpart,
    brukerID,
    brukerNavn,
    saksnummer,
    virksomhetOrgnr,
    virksomhetNavn,
    periodeFraOgMed,
    periodeTilOgMed,
    soknadslandFlereLandUkjentHvilke,
    soknadsland,
    skalTilordnes,
    mottaksdato,
    behandlingsaarsakType,
    behandlingsaarsakFritekst,
  } = formValues || {};

  const nullstillFelt = (felt: string, verdi: any = null) => change(felt, verdi);
  useEffect(() => {
    hentLandkoder();
    return () => {
      dispatch(fagsakOperations.resetFagsakState());
    };
  }, []);

  const hentBruker = async (personIdent: string) => {
    if (Utils.person.erGyldigFnrEllerDnr(personIdent)) {
      const navn = await hentSammensattNavn(personIdent);
      change("brukerNavn", navn);
      setFagsakerOgOppgaverHentes(true);
      await hentFagsakListe(personIdent);
      setFagsakerOgOppgaverHentes(false);
    } else {
      nullstillFelt("brukerNavn");
    }
  };

  const hentVirksomhet = async (orgnr: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(orgnr)) {
      const response = await sokOrgnr(orgnr);
      const navn = response?.data.navn;
      change("virksomhetNavn", navn);
      setFagsakerOgOppgaverHentes(true);
      await hentFagsakListe(virksomhetOrgnr);
      setFagsakerOgOppgaverHentes(false);
    } else {
      nullstillFelt("virksomhetNavn");
    }
  };

  useEffect(() => {
    hentBruker(brukerID);
  }, [brukerID]);

  useEffect(() => {
    hentVirksomhet(virksomhetOrgnr);
  }, [virksomhetOrgnr]);

  useEffect(() => {
    if (hovedpart === BRUKER) {
      nullstillFelt("virksomhetOrgnr");
      nullstillFelt("virksomhetNavn");
    }
    if (hovedpart === VIRKSOMHET) {
      nullstillFelt("brukerID");
      nullstillFelt("brukerNavn");
    }
    nullstillFelt("journalpostID");
  }, [hovedpart]);

  const dataForOpprettSak = (fellesData: Api.Fagsaker.fagsak.OpprettReqDto) => {
    const skalSendePeriodeOgLand = skalViseSoknadsperiodeOgLand(sakstype, sakstema, behandlingstema, behandlingstype);

    const fom = skalSendePeriodeOgLand && periodeFraOgMed ? Utils.dato.formatterDatoTilISO(periodeFraOgMed) : null;
    const tom = skalSendePeriodeOgLand && periodeTilOgMed ? Utils.dato.formatterDatoTilISO(periodeTilOgMed) : null;

    const soknadDto = {
      periode: { fom, tom },
      land: {
        landkoder: skalSendePeriodeOgLand ? soknadsland : [],
        flereLandUkjentHvilke: skalSendePeriodeOgLand && soknadslandFlereLandUkjentHvilke,
      },
    };

    return {
      ...fellesData,
      hovedpart,
      brukerID,
      virksomhetOrgnr,
      sakstype,
      sakstema,
      soknadDto,
    };
  };

  const handleSubmit = async () => {
    setBekreftPending(true);
    setVisFeilmeldinger(true);

    touch(...Object.keys(errors));

    if (!Utils._isEmpty(errors)) {
      setBekreftPending(false);
      return;
    }

    const fellesData = {
      behandlingstema,
      behandlingstype,
      skalTilordnes,
      mottaksdato: Utils.dato.formatterDatoTilISO(mottaksdato) as string,
      behandlingsaarsakType,
      behandlingsaarsakFritekst:
        behandlingsaarsakType === MKV.Koder.behandlinger.behandlingsaarsaktyper.FRITEKST
          ? behandlingsaarsakFritekst
          : undefined,
    };

    if (saksnummer !== "-1") {
      await lagNyBehandlingForSak(saksnummer, fellesData);
    } else {
      await lagNySak(dataForOpprettSak(fellesData));
    }

    setBekreftPending(false);
    const refreshOversiktDelayMillis = 2500;
    setTimeout(() => dispatch(oppgaverOperations.oversikt()), refreshOversiktDelayMillis * 3);
  };

  const nullstillFormVerdier = () => {
    nullstillFelt("sakstype");
    nullstillFelt("sakstema");
    nullstillFelt("behandlingstema");
    nullstillFelt("behandlingstype");
    nullstillFelt("periodeFraOgMed");
    nullstillFelt("periodeTilOgMed");
    nullstillFelt("soknadslandFlereLandUkjentHvilke");
    nullstillFelt("soknadsland", []);
    setVisFeilmeldinger(false);
  };

  const hovedpartErBruker = hovedpart === BRUKER;
  const visFagsakOgOppgaveVelger = brukerNavn || virksomhetNavn;

  if (!formValues) return null;
  return (
    <Nav.Container fluid className="opprettnysak">
      <Nav.Row>
        <Nav.Column xs="8">
          <Nav.Column xs="8">
            <div className="seksjon">
              <Mui.Undertittel
                tekst="Hvem skal saken opprettes på?"
                ikon={Ikoner.FindAccount}
                className="undertittel"
                understrek
              />
              <div className="innrykk">
                <Nav.RadioGroup
                  defaultValue={BRUKER}
                  onChange={(value) => change("hovedpart", value)}
                  legend=""
                  hideLegend
                  size="medium"
                  className="horisontal_radiogruppe"
                >
                  <HStack gap="3" justify="space-between">
                    <EnkelNavBox focused={hovedpartErBruker}>
                      <Nav.Radio value={BRUKER}>Bruker</Nav.Radio>
                    </EnkelNavBox>
                    <EnkelNavBox focused={!hovedpartErBruker}>
                      <Nav.Radio value={VIRKSOMHET}>Virksomhet</Nav.Radio>
                    </EnkelNavBox>
                  </HStack>
                </Nav.RadioGroup>
              </div>
            </div>
            <div className="seksjon">
              {hovedpartErBruker ? (
                <IdentOgNavn
                  tittel="Informasjon om bruker"
                  feltNavn="brukerID"
                  label="Brukers f.nr. eller d-nr.:"
                  navn={brukerNavn}
                />
              ) : (
                <IdentOgNavn
                  tittel="Informasjon om virksomhet"
                  feltNavn="virksomhetOrgnr"
                  label="Organisasjonsnummer:"
                  navn={virksomhetNavn}
                />
              )}
            </div>
            {visFagsakOgOppgaveVelger && (
              <>
                <div className="seksjon">
                  <Mui.Undertittel
                    tekst="Knytt til eksisterende sak eller opprett ny"
                    ikon={Ikoner.Links}
                    className="undertittel"
                    understrek
                  />
                  {fagsakerOgOppgaverHentes ? (
                    <Spinner />
                  ) : (
                    <div className="innrykk">
                      <FagsakVelger
                        erJournalføring={false}
                        fagsakListe={fagsakListe}
                        landkoder={landkoderListe}
                        nullstillFormVerdier={nullstillFormVerdier}
                        formValues={formValues}
                      />
                    </div>
                  )}
                </div>
                <div className="seksjon">
                  <Mui.Undertittel
                    tekst="Oppgi mottaksdato og behandlingsårsak"
                    ikon={Ikoner.CheckList}
                    className="undertittel"
                    understrek
                  />
                  {fagsakerOgOppgaverHentes ? (
                    <Spinner />
                  ) : (
                    <div className="innrykk">
                      <OpprettNyOppgave />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="seksjon">
              <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg behandlingen i mine oppgaver" />
              {visFeilmeldinger && !Utils._isEmpty(errors) && (
                <Nav.Alert variant="error" className="feilmelding">
                  {Utils.feilmelding.syncErrorsTilFeilmelding(errors)}
                </Nav.Alert>
              )}
              <Feilmeldinger className="feilmelding" />
              <Knapperad
                bekreft={handleSubmit}
                bekreftTekst="Opprett ny behandling"
                bekreftRedigerbart={!fagsakerOgOppgaverHentes}
                avbryt={tilForsiden}
                avbrytTekst="Avbryt"
                redigerbart
                spinner={bekreftPending}
              />
            </div>
          </Nav.Column>
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
}

const OpprettNySakForm = reduxForm<OpprettNySakFormData, OpprettNySakProps>({
  form: KV.Form.OPPRETT_NY_SAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(opprettNySakSchema),
})(OpprettNySak);

export default connector(OpprettNySakForm);
