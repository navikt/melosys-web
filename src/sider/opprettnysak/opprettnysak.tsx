import React, { FormEvent, useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch } from "react-redux";
import { getFormValues, InjectedFormProps, isValid, reduxForm, change as changeJournalforing } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Skjema from "../../felleskomponenter/skjema";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";

import Knapperad from "../../felleskomponenter/knapperad";
import FagsakVelger from "../journalforing/komponenter/fagsakVelger";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { fagsakOperations } from "../../ducks/fagsaker";
import { formOperations, formSelectors } from "../../ducks/form";
import { hentSammensattNavn } from "../../graphql/navn";
import { useFeatureToggle } from "../../featuretoggle";
import IdentOgNavn from "./identOgNavn";

import { lagYupToReduxformErrorMapper } from "../../yup";
import opprettNySakSchema from "./opprettnysakSchema";
import "./opprettnysak.css";
import { sokOperations, sokSelectors } from "../../ducks/sok";
import { OppgaveVelger } from "./komponenter/oppgaveVelger";
import { landkoderOperations, landkoderSelectors } from "../../ducks/landkoder";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

interface OpprettNySakFormData {
  opprettnysak_behandlingstema: string;
  opprettnysak_behandlingstype: string;
  journalforingPeriodeFraOgMed: string;
  journalforingPeriodeTilOgMed: string;
  erEksisterendeSak: boolean;
  journalforingSoknadslandUkjenteEllerAlleEosLand: boolean;
  journalforingSoknadsland: [];
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
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  fagsakListe: sokSelectors.FagsakSokSelector(state),
  initialValues: {
    skalTilordnes: false,
    behandlingstema: undefined,
    behandlingstype: undefined,
    hovedpart: BRUKER,
  },
  landkoderListe: landkoderSelectors.LandkoderSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
  formIsValid: isValid(KV.Form.OPPRETT_NY_SAK)(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.OPPRETT_NY_SAK)),
  opprettSak: (body: Api.Fagsaker.fagsak.OpprettReqDto) => dispatch(fagsakOperations.opprett(body)),
  lagNySak: (body: Api.Fagsaker.fagsak.OpprettReqDto) => dispatch(fagsakOperations.lagNySak(body)),
  lagNyBehandlingForSak: (saksnummer: string, body: Api.Fagsaker.fagsak.OpprettReqDto) =>
    dispatch(fagsakOperations.lagNyBehandlingForSak(saksnummer, body)),
  hentFagsakListe: (fnrEllerOrgnr: string) => dispatch(sokOperations.sok(fnrEllerOrgnr)),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  settJournalforingHensikt: (journalforingHensikt: string) =>
    dispatch(changeJournalforing(KV.Form.JOURNALFORING, "journalforingHensikt", journalforingHensikt)),
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
  settJournalforingHensikt,
  error: formError,
  feilmeldinger,
  opprettSak,
  lagNySak,
  lagNyBehandlingForSak,
  hentFagsakListe,
  fagsakListe,
  touchAll,
  formIsValid,
  sokOrgnr,
  hentLandkoder,
  landkoderListe,
}: InjectedFormProps<OpprettNySakFormData, OpprettNySakProps> & OpprettNySakProps) => {
  const [oppgaver, setOppgaver] = useState<Api.Oppgaver.SokOppgaveResDto[]>([]);
  const [bekreftPending, setBekreftPending] = useState(false);
  const [oppgaverForsoktHentet, setOppgaverForsoktHentet] = useState(false);
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const {
    opprettnysak_behandlingstema: behandlingstema,
    opprettnysak_behandlingstype: behandlingstype,
    sakstype,
    sakstema,
    hovedpart,
    erEksisterendeSak,
    brukerID,
    brukerNavn,
    saksnummer,
    virksomhetOrgnr,
    virksomhetNavn,
    journalforingPeriodeFraOgMed,
    journalforingPeriodeTilOgMed,
    journalforingSoknadslandUkjenteEllerAlleEosLand,
    journalforingSoknadsland,
  } = formValues || {};

  const [erRedigerbart, setErRedigerbart] = useState(false);
  const { tom, fom, erUkjenteEllerAlleEosLand, landkoder } = {
    fom: journalforingPeriodeFraOgMed,
    tom: journalforingPeriodeTilOgMed,
    erUkjenteEllerAlleEosLand: journalforingSoknadslandUkjenteEllerAlleEosLand,
    landkoder: journalforingSoknadsland,
  };
  const soknadErValgt = MKVUtils.erSoknad(behandlingstema);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(changeJournalforing(KV.Form.JOURNALFORING, "journalforingGjelder", hovedpart));
  }, [hovedpart]);

  useEffect(() => {
    const opprettNySakKriterier =
      sakstype !== undefined &&
      sakstema !== undefined &&
      behandlingstema !== undefined &&
      behandlingstype !== undefined;

    const eksisterendeSakKriterier = behandlingstema !== undefined && behandlingstype !== undefined;

    setErRedigerbart(erEksisterendeSak ? eksisterendeSakKriterier : opprettNySakKriterier);
  }, [sakstype, sakstema, behandlingstema, behandlingstype, erEksisterendeSak]);

  useEffect(() => {
    hentLandkoder();
  }, []);

  const validerForm = () => {
    touchAll();
    return formIsValid;
  };
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
    } else {
      change("brukerNavn", null);
    }
    await hentFagsakListe(personIdent);
    await hentOppgaver(personIdent);
  };

  const hentVirksomhet = async (orgnr: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(orgnr)) {
      const response = await sokOrgnr(orgnr);
      const navn = response?.data.navn;
      change("virksomhetNavn", navn);
    } else {
      change("virksomhetNavn", null);
    }
    await hentFagsakListe(virksomhetOrgnr);
    await hentOppgaver(virksomhetOrgnr);
  };

  useEffect(() => {
    hentBruker(brukerID);
  }, [brukerID]);

  useEffect(() => {
    hentVirksomhet(virksomhetOrgnr);
  }, [virksomhetOrgnr]);

  useEffect(() => {
    change("brukerID", 30056928150);
    if (hovedpart === BRUKER) {
      change("virksomhetOrgnr", null);
      change("virksomhetNavn", null);
    }
    if (hovedpart === VIRKSOMHET) {
      change("brukerID", null);
      change("brukerNavn", null);
    }
    change("oppgaveID", null);
    change("journalpostID", null);
    setOppgaver([]);
    setOppgaverForsoktHentet(false);
  }, [hovedpart]);

  const opprettNySak = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validerForm()) return;
    setBekreftPending(true);
    const fraOgMed = fom && soknadErValgt ? Utils.dato.formatterDatoTilISO(fom) : null;
    const tilOgMed = tom && soknadErValgt ? Utils.dato.formatterDatoTilISO(tom) : null;

    const soknadDto = {
      periode: {
        fom: fraOgMed,
        tom: tilOgMed,
      },
      land: {
        landkoder: soknadErValgt ? landkoder : [],
        erUkjenteEllerAlleEosLand: soknadErValgt ? erUkjenteEllerAlleEosLand : false,
      },
    };

    const { skalTilordnes, oppgaveID } = formValues;
    const skalOppretteNyOppgaveOgKnyttSak =
      (erEksisterendeSak || oppgaveID === null) && behandleAlleSakerToggle === "enabled";
    const data = {
      brukerID,
      sakstype,
      sakstema,
      behandlingstema,
      behandlingstype,
      hovedpart,
      soknadDto,
      skalTilordnes,
      oppgaveID,
    };
    if (skalOppretteNyOppgaveOgKnyttSak) {
      if (saksnummer) {
        lagNyBehandlingForSak(saksnummer, data).finally(() => setBekreftPending(false));
      } else {
        lagNySak(data).finally(() => setBekreftPending(false));
      }
    } else {
      opprettSak(data).finally(() => setBekreftPending(false));
    }
  };
  const nullstillFormVerdier = () => {
    change("opprettnysak_behandlingstema", undefined);
    change("opprettnysak_behandlingstype", undefined);
    change("journalforingPeriodeFraOgMed", undefined);
    change("journalforingPeriodeTilOgMed", undefined);
    change("journalforingSoknadslandUkjenteEllerAlleEosLand", undefined);
    change("journalforingSoknadsland", undefined);
    change("sakstype", undefined);
    change("sakstema", undefined);
    change("saksnummer", undefined);
  };
  const hovedpartErBruker = hovedpart === BRUKER;

  return (
    <form className="opprettnysak" onSubmit={opprettNySak}>
      <Nav.Container fluid>
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
              <div className="seksjon">
                <Mui.Undertittel
                  tekst="Knytt til eksisterende sak eller opprett ny"
                  ikon={Ikoner.Link}
                  className="undertittel"
                  understrek
                />
                <div className="innrykk">
                  <FagsakVelger
                    erOpprettNySak
                    fagsakListe={fagsakListe}
                    settJournalforingHensikt={settJournalforingHensikt}
                    behandleAlleSakerToggleEnabled={behandleAlleSakerToggle === "enabled"}
                    landkoder={landkoderListe}
                    nullstillFormVerdier={nullstillFormVerdier}
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
                    visToppValg={!erEksisterendeSak}
                    oppgaverForsoktHentet={oppgaverForsoktHentet}
                    hovedpart={hovedpart}
                    change={change}
                    oppgaver={oppgaver}
                  />
                </div>
              </div>
              <div className="seksjon">
                <Feilmeldinger feilmeldinger={feilmeldinger} />
                <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg behandlingen i mine oppgaver" />
                {formError && <Nav.AlertStripeAdvarsel className="formError">{formError}</Nav.AlertStripeAdvarsel>}
                <Knapperad
                  bekreftTekst="Opprett sak"
                  avbryt={tilForsiden}
                  avbrytTekst="Avbryt"
                  redigerbart
                  bekreftRedigerbart={!bekreftPending && erRedigerbart}
                  spinner={bekreftPending}
                  bekreftHtmlType="submit"
                />
              </div>
            </Nav.Column>
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </form>
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
