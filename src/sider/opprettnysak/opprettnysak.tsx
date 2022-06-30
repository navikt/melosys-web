import React, { FormEvent, Fragment, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { FormSection, getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Nav from "../../navFrontend";
import * as Skjema from "../../felleskomponenter/skjema";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import { fagsakOperations } from "../../ducks/fagsaker";

import Knapperad from "../../felleskomponenter/knapperad";
import EnkeltDato from "../../felleskomponenter/datoOmrade/enkeltDato";

import MKV, { Utils as MKVUtils } from "../../melosyskodeverk";
import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { hentSammensattNavn } from "../../graphql/navn";
import { lagYupToReduxformErrorMapper } from "../../yup";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import opprettNySakSchema from "./opprettnysakSchema";

import "./opprettnysak.css";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";
import { formOperations } from "../../ducks/form";
import { OpprettReqDto } from "../../services/modules/fagsaker/fagsak";
import { Oppgave } from "../../services/modules/types/oppgave";

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.OPPRETT_NY_SAK)(state) as KV.Form.OpprettNySakFormData,
  initialValues: {
    skalTilordnes: false,
    behandlingstema: undefined,
    soknadsinfo: { landkoder: [], erUkjenteEllerAlleEosLand: false },
  },
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
  formIsValid: isValid(KV.Form.OPPRETT_NY_SAK)(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.OPPRETT_NY_SAK)),
  opprettSak: (body: OpprettReqDto) => dispatch(fagsakOperations.opprett(body)),
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
}: InjectedFormProps<KV.Form.OpprettNySakFormData, OpprettNySakProps> & OpprettNySakProps) => {
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [bekreftPending, setBekreftPending] = useState(false);
  const [oppgaverForsoktHentet, setOppgaverForsoktHentet] = useState(false);
  const [folketrygdenToggleEnabled, setFolketrygdenToggleEnabled] = useState(false);
  const [behandleAlleSakerToggleEnabled, setBehandleAlleSakerToggleEnabled] = useState(false);

  const { behandlingstema, soknadsinfo, sakstype, hovedpart, brukerID, brukerNavn, virksomhetOrgnr, virksomhetNavn } =
    formValues || {};
  const { landkoder, erUkjenteEllerAlleEosLand } = soknadsinfo || {};
  const soknadErValgt = MKVUtils.erSoknad(behandlingstema);

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
    erFeatureToggleEnabled("melosys.folketrygden.mvp").then((res) => {
      setFolketrygdenToggleEnabled(res);
    });
    erFeatureToggleEnabled("melosys.behandle_alle_saker").then((res) => {
      setBehandleAlleSakerToggleEnabled(res);
    });
  }, []);

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
    const tomErUtfylt = soknadsinfo && soknadsinfo.tom;
    const tom = tomErUtfylt && soknadErValgt ? Utils.dato.formatterDatoTilISO(soknadsinfo.tom) : null;

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
      (folketrygdenToggleEnabled && kode === MKV.Koder.sakstyper.FTRL) ||
      kode === MKV.Koder.sakstyper.TRYGDEAVTALE
  );

  const hentValgbareBehandlingstema = () => {
    switch (sakstype) {
      case MKV.Koder.sakstyper.FTRL:
        return ftrlBehandlingstemaer;
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return trygdeavtaleBehandlingstemaer;
      case MKV.Koder.sakstyper.EU_EOS:
        return euEosBehandlingstemaer;
      default:
        return [];
    }
  };

  const settJournalpostID = (oppgaveID: string) => {
    const oppgave = oppgaver.find((o) => o.oppgaveID === oppgaveID);
    change("journalpostID", oppgave?.journalpostID);
  };

  // eslint-disable-next-line react/prop-types
  const IdentOgNavn = ({
    tittel,
    feltNavn,
    label,
    navn,
  }: {
    tittel: string;
    feltNavn: string;
    label: string;
    navn: string;
  }) => (
    <>
      <Mui.Undertittel tekst={tittel} ikon={Ikoner.AccountCircle} className="undertittel" understrek />
      <div className="innrykk marginBottom">
        <Skjema.Input feltNavn={feltNavn} label={label} />
        {!Utils._isEmpty(navn) && (
          <span>
            <Nav.Typo.Element className="navnTittel">Navn:</Nav.Typo.Element>
            <Nav.Typo.Normaltekst className="navn">{navn}</Nav.Typo.Normaltekst>
          </span>
        )}
      </div>
    </>
  );
  const erLandvelgerDisabled =
    erUkjenteEllerAlleEosLand && behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;

  const hovedpartErBruker = hovedpart === BRUKER;

  // @ts-ignore
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
                  {behandleAlleSakerToggleEnabled && (
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
                        // @ts-ignore
                        onChange={(event) => change("hovedpart", event.target.value)}
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
                      onChange={() => change("behandlingstema", undefined)}
                    >
                      {valgbareSakstyper.map(({ kode, term }: KTObject) => (
                        <option key={kode} value={kode}>
                          {term}
                        </option>
                      ))}
                    </Skjema.Select>
                    <Skjema.Select
                      feltNavn="behandlingstema"
                      bredde="fullbredde"
                      label="Behandlingstema"
                      onChange={() => change("soknadsinfo.erUkjenteEllerAlleEosLand", false)}
                    >
                      {hentValgbareBehandlingstema().map(({ kode, term }: KTObject) => (
                        <option key={kode} value={kode}>
                          {term}
                        </option>
                      ))}
                    </Skjema.Select>
                    {soknadErValgt && hovedpartErBruker && (
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
                                <div>
                                  Flere EØS-land/Sveits. Ikke kjent hvilke
                                  <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre}>
                                    Når søker ikke vet hvilke land arbeidet/næringen skal utføres i, krysser du av her.
                                    <br />
                                    Det er ikke mulig å legge til andre land i tillegg.
                                  </Nav.Hjelpetekst>
                                </div>
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

const euEosBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema
  .filter(({ kode }: { kode: string }) => MKVUtils.erSoknad(kode) || MKVUtils.erSedForesporsel(kode))
  .filter(
    ({ kode }: { kode: string }) =>
      kode !== MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND &&
      kode !== MKV.Koder.behandlinger.behandlingstema.TRYGDETID
  );

const ftrlBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }: { kode: string }) => kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
);

const trygdeavtaleBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }: { kode: string }) => kode === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
);

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const OpprettNySakForm = reduxForm<KV.Form.OpprettNySakFormData, OpprettNySakProps>({
  form: KV.Form.OPPRETT_NY_SAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(opprettNySakSchema),
})(OpprettNySak);

export default connector(OpprettNySakForm);
