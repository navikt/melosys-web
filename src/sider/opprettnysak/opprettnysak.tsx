import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
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
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { sokOperations, sokSelectors } from "../../ducks/sok";
import { fagsakOperations } from "../../ducks/fagsaker";

import Knapperad from "../../felleskomponenter/knapperad";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import { hentSammensattNavn } from "../../graphql/navn";
import { useFeatureToggle } from "../../featuretoggle";
import FagsakVelger from "../journalforing/komponenter/fagsakVelger";
import {
  skalViseSoknadsperiodeOgLand,
  skalViseSoknadsperiodeOgLandDeprecated,
} from "../journalforing/komponenter/opprettSak";

import { OppgaveVelger } from "./komponenter/oppgaveVelger";
import IdentOgNavn from "./komponenter/identOgNavn";

import { lagYupToReduxformErrorMapper } from "../../yup";
import opprettNySakSchema from "./opprettnysakSchema";
import "./opprettnysak.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

interface OpprettNySakFormData {
  behandlingstema: string;
  behandlingstype: string;
  periodeFraOgMed: string;
  periodeTilOgMed: string;
  soknadslandUkjenteEllerAlleEosLand: boolean;
  soknadsland: [];
  opprettBehandling: boolean;
  saksnummer: string;
  sakstype: string;
  sakstema: string;
  brukerID: string;
  skalTilordnes: boolean;
  oppgaveID: string;
  hovedpart: string;
  brukerNavn: string;
  virksomhetOrgnr: string;
  virksomhetNavn: string;
}

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.OPPRETT_NY_SAK)(state) as OpprettNySakFormData,
  errors: getFormSyncErrors(KV.Form.OPPRETT_NY_SAK)(state),
  fagsakListe: sokSelectors.FagsakSokSelector(state),
  initialValues: {
    skalTilordnes: false,
    behandlingstema: undefined,
    behandlingstype: undefined,
    sakstype: undefined,
    sakstema: undefined,
    hovedpart: BRUKER,
    opprettBehandling: true,
  },
  landkoderListe: landkoderSelectors.LandkoderSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
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

const OpprettNySak = ({
  formValues,
  tilForsiden,
  change,
  touch,
  errors,
  feilmeldinger,
  lagNySak,
  lagNyBehandlingForSak,
  hentFagsakListe,
  fagsakListe,
  sokOrgnr,
  hentLandkoder,
  landkoderListe,
}: InjectedFormProps<OpprettNySakFormData, OpprettNySakProps> & OpprettNySakProps) => {
  const [oppgaver, setOppgaver] = useState<Api.Oppgaver.SokOppgaveResDto[]>([]);
  const [bekreftPending, setBekreftPending] = useState(false);
  const [knappTrykketPå, setKnappTrykketPå] = useState(false);
  const [oppgaverForsoktHentet, setOppgaverForsoktHentet] = useState(false);
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const nyOpprettSakToggle = useFeatureToggle("melosys.ny_opprett_sak");
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
    soknadslandUkjenteEllerAlleEosLand,
    soknadsland,
    skalTilordnes,
    oppgaveID,
  } = formValues || {};

  const nullstillFelt = (felt: string, verdi: any = null) => change(felt, verdi);

  useEffect(() => {
    hentLandkoder();
  }, []);

  useEffect(() => {
    // Fjernes med toggle melosys.behandle_alle_saker
    change("behandleAlleSakerToggleEnabled", behandleAlleSakerToggle === "enabled");
  }, [behandleAlleSakerToggle]);

  const hentOppgaver = async (value: string) => {
    if (Utils.person.erGyldigFnrEllerDnr(value) || Utils.organisasjon.erOrgnrGyldig(value)) {
      try {
        const oppgaverResponse = await Api.Oppgaver.sok(
          Utils.person.erGyldigFnrEllerDnr(value) ? value : null,
          Utils.organisasjon.erOrgnrGyldig(value) ? value : null
        );
        setOppgaver(oppgaverResponse);
        setOppgaverForsoktHentet(true);
      } catch (e) {
        setOppgaver([]);
      }
    } else {
      setOppgaver([]);
      setOppgaverForsoktHentet(false);
    }
  };

  const hentBruker = async (personIdent: string) => {
    if (Utils.person.erGyldigFnrEllerDnr(personIdent)) {
      const navn = await hentSammensattNavn(personIdent);
      change("brukerNavn", navn);
      await hentFagsakListe(personIdent);
      await hentOppgaver(personIdent);
    } else {
      nullstillFelt("brukerNavn");
    }
  };

  const hentVirksomhet = async (orgnr: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(orgnr)) {
      const response = await sokOrgnr(orgnr);
      const navn = response?.data.navn;
      change("virksomhetNavn", navn);
      await hentFagsakListe(virksomhetOrgnr);
      await hentOppgaver(virksomhetOrgnr);
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
    nullstillFelt("oppgaveID");
    nullstillFelt("journalpostID");
    setOppgaver([]);
    setOppgaverForsoktHentet(false);
  }, [hovedpart]);

  const dataForOpprettSak = (fellesData: Api.Fagsaker.fagsak.OpprettReqDto) => {
    const skalSendePeriodeOgLand =
      behandleAlleSakerToggle === "enabled"
        ? skalViseSoknadsperiodeOgLand(sakstype, sakstema, behandlingstema, behandlingstype)
        : skalViseSoknadsperiodeOgLandDeprecated(hovedpart, sakstype, behandlingstema);

    const fom = skalSendePeriodeOgLand && periodeFraOgMed ? Utils.dato.formatterDatoTilISO(periodeFraOgMed) : null;
    const tom = skalSendePeriodeOgLand && periodeTilOgMed ? Utils.dato.formatterDatoTilISO(periodeTilOgMed) : null;

    const soknadDto = {
      periode: { fom, tom },
      land: {
        landkoder: skalSendePeriodeOgLand ? soknadsland : [],
        erUkjenteEllerAlleEosLand: skalSendePeriodeOgLand && soknadslandUkjenteEllerAlleEosLand,
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
      oppgaveID,
    };
  };

  const handleSubmit = () => {
    setBekreftPending(true);
    setKnappTrykketPå(true);

    touch(...Object.keys(errors));

    if (!Utils._isEmpty(errors)) {
      setBekreftPending(false);
      return;
    }

    const fellesData = {
      behandlingstema,
      behandlingstype,
      skalTilordnes,
    };

    if (saksnummer !== "-1" && nyOpprettSakToggle === "enabled") {
      lagNyBehandlingForSak(saksnummer, fellesData).finally(() => setBekreftPending(false));
    } else {
      lagNySak(dataForOpprettSak(fellesData)).finally(() => setBekreftPending(false));
    }
  };

  const nullstillFormVerdier = () => {
    nullstillFelt("sakstype");
    nullstillFelt("sakstema");
    nullstillFelt("behandlingstema");
    nullstillFelt("behandlingstype");
    nullstillFelt("periodeFraOgMed");
    nullstillFelt("periodeTilOgMed");
    nullstillFelt("soknadslandUkjenteEllerAlleEosLand");
    nullstillFelt("soknadsland", []);
  };

  const hovedpartErBruker = hovedpart === BRUKER;
  const visFagsakOgOppgaveVelger = brukerNavn || virksomhetNavn;

  if (!formValues) return null;
  return (
    <Nav.Container fluid className="opprettnysak">
      <Nav.Row>
        <Nav.Column xs="8">
          <Nav.Column xs="8">
            {behandleAlleSakerToggle === "enabled" && (
              <div className="seksjon">
                <Mui.Undertittel
                  tekst="Hvem skal saken opprettes på?"
                  ikon={Ikoner.FindAccount}
                  className="undertittel"
                  understrek
                />
                <Nav.RadioPanelGruppe
                  name="hovedpart"
                  legend=""
                  radios={[
                    { label: "Bruker", value: BRUKER, id: BRUKER },
                    { label: "Virksomhet", value: VIRKSOMHET, id: VIRKSOMHET },
                  ]}
                  checked={hovedpart}
                  onChange={(event, value) => change("hovedpart", value)}
                  className="hovedpart innrykk"
                />
              </div>
            )}
            <div className="seksjon">
              {hovedpartErBruker ? (
                <IdentOgNavn
                  tittel="Informasjon om bruker"
                  feltNavn="brukerID"
                  label="Brukers f.nr eller d.nr:"
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
                    tekst={
                      nyOpprettSakToggle === "enabled"
                        ? "Knytt til eksisterende sak eller opprett ny"
                        : "Informasjon om sak"
                    }
                    ikon={Ikoner.Links}
                    className="undertittel"
                    understrek
                  />
                  <div className="innrykk">
                    <FagsakVelger
                      erOpprettNySak
                      fagsakListe={fagsakListe}
                      behandleAlleSakerToggleEnabled={behandleAlleSakerToggle === "enabled"}
                      landkoder={landkoderListe}
                      nullstillFormVerdier={nullstillFormVerdier}
                      formValues={formValues}
                    />
                  </div>
                </div>
                <div className="seksjon">
                  <Mui.Undertittel
                    tekst="Knytt til eksisterende Gosys oppgave eller opprett ny"
                    ikon={Ikoner.CheckList}
                    className="undertittel"
                    understrek
                  />
                  <div className="innrykk">
                    <OppgaveVelger
                      oppgaverForsoktHentet={oppgaverForsoktHentet}
                      hovedpart={hovedpart}
                      saksnummer={saksnummer}
                      change={change}
                      oppgaver={oppgaver}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="seksjon">
              <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg behandlingen i mine oppgaver" />
              {knappTrykketPå && !Utils._isEmpty(errors) && (
                <Nav.AlertStripeFeil className="feilmelding">
                  {Utils.feilmelding.syncErrorsTilFeilmelding(errors)}
                </Nav.AlertStripeFeil>
              )}
              <Feilmeldinger feilmeldinger={feilmeldinger} className="feilmelding" />
              <Knapperad
                bekreft={handleSubmit}
                bekreftTekst={nyOpprettSakToggle === "enabled" ? "Opprett ny behandling" : "Opprett sak"}
                avbryt={tilForsiden}
                avbrytTekst="Avbryt"
                redigerbart
                spinner={bekreftPending}
                autoDisableVedSpinner
              />
            </div>
          </Nav.Column>
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
};

const OpprettNySakForm = reduxForm<OpprettNySakFormData, OpprettNySakProps>({
  form: KV.Form.OPPRETT_NY_SAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(opprettNySakSchema),
})(OpprettNySak);

export default connector(OpprettNySakForm);
