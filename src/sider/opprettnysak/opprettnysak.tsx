import React, { FormEvent, Fragment, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { FormSection, getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Skjema from "../../felleskomponenter/skjema";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";

import Knapperad from "../../felleskomponenter/knapperad";
import EnkeltDato from "../../felleskomponenter/enkeltDato";
import LabelMedHjelpetekst from "../../felleskomponenter/labelMedHjelpetekst";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { fagsakOperations } from "../../ducks/fagsaker";
import { formOperations } from "../../ducks/form";

import { hentSammensattNavn } from "../../graphql/navn";
import { useFeatureToggle } from "../../featuretoggle";
import { nullstillFormdataVerdier, FormDataVerdi } from "../../felleskomponenter/skjema/formdatahjelper/nullstillsak";
import { skalViseTomFlytEllerErSedBehandling } from "../../routing";
import IdentOgNavn from "./identOgNavn";

import { lagYupToReduxformErrorMapper } from "../../yup";
import opprettNySakSchema from "./opprettnysakSchema";
import "./opprettnysak.css";

const euEosBehandlingstemaer = (visNyeBehandlingstema: boolean) =>
  MKV.KTObjects.behandlinger.behandlingstema
    .filter(({ kode }: { kode: string }) => MKVUtils.erSoknad(kode) || MKVUtils.erSedForesporsel(kode))
    .filter(
      ({ kode }: { kode: string }) =>
        kode !== MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND &&
        kode !== MKV.Koder.behandlinger.behandlingstema.TRYGDETID
    )
    .filter(({ kode }: { kode: string }) => {
      if (visNyeBehandlingstema) {
        return true;
      }
      return ![
        MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
      ].includes(kode);
    });

const ftrlBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }: { kode: string }) => kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
);

const trygdeavtaleBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }: { kode: string }) => kode === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
);

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

interface OpprettNySakFormData {
  behandlingstema: string;
  behandlingstype: string;
  soknadsinfo: any;
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
  initialValues: {
    skalTilordnes: false,
    behandlingstema: undefined,
    soknadsinfo: { landkoder: [], erUkjenteEllerAlleEosLand: false },
    hovedpart: BRUKER,
  },
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
  formIsValid: isValid(KV.Form.OPPRETT_NY_SAK)(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.OPPRETT_NY_SAK)),
  opprettSak: (body: Api.Fagsaker.fagsak.OpprettReqDto) => dispatch(fagsakOperations.opprett(body)),
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
  error: formError,
  feilmeldinger,
  opprettSak,
  touchAll,
  formIsValid,
  sokOrgnr,
}: InjectedFormProps<OpprettNySakFormData, OpprettNySakProps> & OpprettNySakProps) => {
  const [oppgaver, setOppgaver] = useState<Api.Oppgaver.SokOppgaveResDto[]>([]);
  const [bekreftPending, setBekreftPending] = useState(false);
  const [oppgaverForsoktHentet, setOppgaverForsoktHentet] = useState(false);
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");

  const [sakstyper, setSakstyper] = useState([]);
  const [sakstemaer, setSakstemaer] = useState([]);
  const [behandlingstemaer, setBehandlingstemaer] = useState([]);
  const [behandlingstyper, setBehandlingstyper] = useState([]);

  const {
    behandlingstema,
    behandlingstype,
    soknadsinfo,
    sakstype,
    sakstema,
    hovedpart,
    brukerID,
    brukerNavn,
    virksomhetOrgnr,
    virksomhetNavn,
  } = formValues || {};
  const { landkoder, erUkjenteEllerAlleEosLand } = soknadsinfo || {};
  const soknadErValgt = MKVUtils.erSoknad(behandlingstema);

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    Api.LovligeKombinasjoner.hentSakstyper().then((muligeSakstyper) => {
      setSakstyper(muligeSakstyper);
    });
  }, [behandleAlleSakerToggle]);

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    if (sakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(hovedpart, sakstype).then((muligeSakstemaer) => {
        setSakstemaer(muligeSakstemaer);
      });
    }
  }, [behandleAlleSakerToggle, hovedpart, sakstype]);

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    if (sakstema && sakstype) {
      if (hovedpart === MKV.Koder.aktoersroller.BRUKER) {
        Api.LovligeKombinasjoner.hentBehandlingstemaer(hovedpart, sakstype, sakstema).then(
          (muligeBehandlingstemaer) => {
            setBehandlingstemaer(muligeBehandlingstemaer);
          }
        );
      } else {
        Api.LovligeKombinasjoner.hentBehandlingstyper(hovedpart, sakstype, sakstema).then((muligeBehandlingstyper) => {
          setBehandlingstyper(muligeBehandlingstyper);
        });
      }
    }
  }, [behandleAlleSakerToggle, hovedpart, sakstype, sakstema]);

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    if (sakstema && sakstype && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(hovedpart, sakstype, sakstema, behandlingstema).then(
        (muligeBehandlingstyper) => {
          setBehandlingstyper(muligeBehandlingstyper);
        }
      );
    }
  }, [behandleAlleSakerToggle, hovedpart, sakstype, sakstema, behandlingstema]);

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

    await hentOppgaver(virksomhetOrgnr);
  };

  useEffect(() => {
    hentBruker(brukerID);
  }, [brukerID]);

  useEffect(() => {
    hentVirksomhet(virksomhetOrgnr);
  }, [virksomhetOrgnr]);

  useEffect(() => {
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
  const opprettNySak = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validerForm()) return;

    setBekreftPending(true);
    const fom = soknadErValgt ? Utils.dato.formatterDatoTilISO(soknadsinfo.fom) : null;
    const tom = soknadsinfo?.tom && soknadErValgt ? Utils.dato.formatterDatoTilISO(soknadsinfo.tom) : null;

    const soknadDto = {
      periode: {
        fom,
        tom,
      },
      land: {
        landkoder: soknadErValgt ? soknadsinfo.landkoder : [],
        erUkjenteEllerAlleEosLand: soknadErValgt ? soknadsinfo.erUkjenteEllerAlleEosLand : false,
      },
    };

    const data = {
      brukerID: formValues.brukerID,
      sakstype: formValues.sakstype,
      behandlingstema: formValues.behandlingstema,
      soknadDto,
      skalTilordnes: formValues.skalTilordnes,
      oppgaveID: formValues.oppgaveID,
    };

    opprettSak(data)
      .then(() => setBekreftPending(false))
      .catch(() => setBekreftPending(false));
  };

  const radioValg = oppgaver.map((oppgave) => {
    const tema = KV.Koder.Tema[oppgave.tema];
    const innhold = (
      <Skjema.CustomRadioPanelElement
        tittel={tema}
        data={[
          { term: "Oppgavetype:", description: oppgave.oppgavetype },
          { term: "Registrert dato:", description: <EnkeltDato dato={oppgave.registrertDato} /> },
          { term: "Frist:", description: <EnkeltDato dato={oppgave.frist} /> },
          { term: "Saksid:", description: oppgave.sakID },
        ]}
      />
    );

    return {
      value: oppgave.oppgaveID,
      innhold,
    };
  });

  const oppgaverFinnes = oppgaver.length > 0;

  const valgbareSakstyper = MKV.KTObjects.sakstyper.filter(
    ({ kode }: { kode: string }) =>
      kode === MKV.Koder.sakstyper.EU_EOS ||
      (folketrygdenToggle === "enabled" && kode === MKV.Koder.sakstyper.FTRL) ||
      kode === MKV.Koder.sakstyper.TRYGDEAVTALE
  );

  const hentValgbareBehandlingstema = () => {
    switch (sakstype) {
      case MKV.Koder.sakstyper.FTRL:
        return ftrlBehandlingstemaer;
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return trygdeavtaleBehandlingstemaer;
      case MKV.Koder.sakstyper.EU_EOS:
        return euEosBehandlingstemaer(behandleAlleSakerToggle === "enabled");
      default:
        return [];
    }
  };

  const settJournalpostID = (oppgaveID: string) => {
    const oppgave = oppgaver.find((o) => o.oppgaveID === oppgaveID);
    change("journalpostID", oppgave?.journalpostID);
  };

  const erLandvelgerDisabled =
    erUkjenteEllerAlleEosLand && behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;

  const hovedpartErBruker = hovedpart === BRUKER;

  const skalViseLandOgSoknadsperiode = () =>
    behandleAlleSakerToggle
      ? sakstype &&
        sakstema &&
        behandlingstema &&
        behandlingstype &&
        !skalViseTomFlytEllerErSedBehandling(sakstype, behandlingstema, behandlingstype)
      : soknadErValgt && hovedpartErBruker;

  return (
    <form className="opprettnysak" onSubmit={opprettNySak}>
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12">
            <h1>Opprett sak</h1>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="8">
            <Nav.Panel>
              <Nav.Row>
                <Nav.Column xs="8">
                  {behandleAlleSakerToggle === "enabled" && (
                    <>
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
                          { label: BRUKER, value: BRUKER, id: BRUKER },
                          { label: VIRKSOMHET, value: VIRKSOMHET, id: VIRKSOMHET },
                        ]}
                        checked={hovedpart}
                        onChange={(event, value) => change("hovedpart", value)}
                        className="hovedpart innrykk"
                      />
                    </>
                  )}

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

                  <Mui.Undertittel
                    tekst="Informasjon om sak"
                    ikon={Ikoner.Filenew}
                    className="undertittel"
                    understrek
                  />
                  <div className="innrykk">
                    <Skjema.Select
                      feltNavn="sakstype"
                      bredde="fullbredde"
                      label="Sakstype"
                      onChange={() => nullstillFormdataVerdier(FormDataVerdi.sakstype, change)}
                    >
                      {(behandleAlleSakerToggle === "enabled" ? sakstyper : valgbareSakstyper).map(
                        ({ kode, term }: KTObject) => (
                          <option key={kode} value={kode}>
                            {term}
                          </option>
                        )
                      )}
                    </Skjema.Select>
                    {behandleAlleSakerToggle === "enabled" && (
                      <Skjema.Select
                        feltNavn="sakstema"
                        bredde="fullbredde"
                        label="Sakstema"
                        onChange={() => nullstillFormdataVerdier(FormDataVerdi.sakstema, change)}
                      >
                        {sakstemaer.map(({ kode, term }: KTObject) => (
                          <option key={kode} value={kode}>
                            {term}
                          </option>
                        ))}
                      </Skjema.Select>
                    )}
                    {hovedpartErBruker && (
                      <Skjema.Select
                        feltNavn="behandlingstema"
                        bredde="fullbredde"
                        label="Behandlingstema"
                        onChange={() => {
                          nullstillFormdataVerdier(FormDataVerdi.behandlingstema, change);
                          change("soknadsinfo.erUkjenteEllerAlleEosLand", false);
                        }}
                      >
                        {(behandleAlleSakerToggle === "enabled"
                          ? behandlingstemaer
                          : hentValgbareBehandlingstema()
                        ).map(({ kode, term }: KTObject) => (
                          <option key={kode} value={kode}>
                            {term}
                          </option>
                        ))}
                      </Skjema.Select>
                    )}
                    {behandleAlleSakerToggle === "enabled" && (
                      <Skjema.Select
                        feltNavn="behandlingstype"
                        bredde="fullbredde"
                        label="Behandlingstype"
                        onChange={() => nullstillFormdataVerdier(FormDataVerdi.behandlingstype, change)}
                      >
                        {behandlingstyper.map(({ kode, term }: KTObject) => (
                          <option key={kode} value={kode}>
                            {term}
                          </option>
                        ))}
                      </Skjema.Select>
                    )}
                    {skalViseLandOgSoknadsperiode() && (
                      <Fragment>
                        <Nav.Typo.Normaltekst>Søknadsperiode</Nav.Typo.Normaltekst>
                        <FormSection name="soknadsinfo">
                          <Nav.Row>
                            <Nav.Column xs="5">
                              <Skjema.Datovelger label="Fra" feltNavn="fom" />
                            </Nav.Column>
                            <Nav.Column xs="5">
                              <Skjema.Datovelger label="Til" feltNavn="tom" />
                            </Nav.Column>
                          </Nav.Row>
                          <Skjema.LandVelger
                            multiLand
                            feltNavn="landkoder"
                            label="Land"
                            errorConfig={{ submitFailed: true }}
                            disabled={erLandvelgerDisabled}
                          />
                          {behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
                            <Skjema.Checkbox
                              feltNavn="erUkjenteEllerAlleEosLand"
                              disabled={landkoder.length > 0}
                              label={
                                <LabelMedHjelpetekst
                                  label="Flere EØS-land/Sveits. Ikke kjent hvilke"
                                  hjelpetekst={
                                    "Når søker ikke vet hvilke land arbeidet/næringen skal utføres i, krysser du av her.\n" +
                                    "Det er ikke mulig å legge til andre land i tillegg."
                                  }
                                  hjelpetekstClassName="hjelpetekst"
                                />
                              }
                            />
                          )}
                        </FormSection>
                      </Fragment>
                    )}
                  </div>
                  <Mui.Undertittel
                    tekst="Knytt oppgave fra Gosys til saken"
                    ikon={Ikoner.CheckList}
                    className="undertittel"
                    understrek
                  />
                  <div className="innrykk">
                    {oppgaverFinnes && (
                      <Skjema.CustomRadioPanelGruppe
                        feltNavn="oppgaveID"
                        radios={radioValg}
                        notify={settJournalpostID}
                      />
                    )}
                    {!oppgaverFinnes && !oppgaverForsoktHentet && (
                      <Nav.AlertStripeInfo>
                        {hovedpartErBruker
                          ? "Skriv inn brukers f.nr eller d.nr for å hente oppgaver."
                          : "Skriv inn virksomhetens organisasjonsnummer for å hente oppgaver."}
                      </Nav.AlertStripeInfo>
                    )}
                    {!oppgaverFinnes && oppgaverForsoktHentet && (
                      <Nav.AlertStripeAdvarsel>
                        {hovedpartErBruker
                          ? "Det finnes ingen oppgaver på denne personen."
                          : "Det finnes ingen oppgaver på denne organisasjonen."}
                      </Nav.AlertStripeAdvarsel>
                    )}
                    <Feilmeldinger feilmeldinger={feilmeldinger} />
                    <Skjema.Checkbox
                      className="skalTilordnes"
                      feltNavn="skalTilordnes"
                      label="Legg behandlingen i mine oppgaver"
                    />
                    {formError && <Nav.AlertStripeAdvarsel className="formError">{formError}</Nav.AlertStripeAdvarsel>}
                    <Knapperad
                      bekreftTekst="Opprett sak"
                      avbryt={tilForsiden}
                      avbrytTekst="Avbryt"
                      redigerbart
                      bekreftRedigerbart={!bekreftPending && oppgaverFinnes}
                      spinner={bekreftPending}
                      bekreftHtmlType="submit"
                    />
                  </div>
                </Nav.Column>
              </Nav.Row>
            </Nav.Panel>
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
