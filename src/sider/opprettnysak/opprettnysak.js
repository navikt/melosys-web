import React, { Fragment, useEffect, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { FormSection, getFormValues, reduxForm, SubmissionError } from "redux-form";

import * as Nav from "../../navFrontend";
import * as Skjema from "../../felleskomponenter/skjema";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";

import Knapperad from "../../felleskomponenter/knapperad";
import EnkeltDato from "../../felleskomponenter/datoOmrade/enkeltDato";

import MKV, { Utils as MKVUtils } from "../../melosyskodeverk";
import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { hentSammensattNavn } from "../../graphql/navn";
import { lagYupToReduxformErrorMapper } from "../../yup";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import opprettNySakSchema from "./opprettnysakSchema";

import "./opprettnysak.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const euEosBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema
  .filter(({ kode }) => MKVUtils.erSoknad(kode) || MKVUtils.erSedForesporsel(kode))
  .filter(
    ({ kode }) =>
      kode !== MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND &&
      kode !== MKV.Koder.behandlinger.behandlingstema.TRYGDETID
  );

const ftrlBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }) => kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET
);

const trygdeavtaleBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema.filter(
  ({ kode }) => kode === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
);

const OpprettNySak = ({ formValues, tilForsiden, handleSubmit, change, error, sokOrgnr }) => {
  const [oppgaver, setOppgaver] = useState([]);
  const [oppgaverForsoktHentet, setOppgaverForsoktHentet] = useState(false);

  const { behandlingstema, soknadsinfo, sakstype, hovedpart, brukerID, brukerNavn, virksomhetOrgnr, virksomhetNavn } =
    formValues;
  const { landkoder, erUkjenteEllerAlleEosLand } = soknadsinfo;
  const soknadErValgt = MKVUtils.erSoknad(behandlingstema);

  const folketrygdenToggleEnabled = erFeatureToggleEnabled("melosys.folketrygden.mvp");
  const behandleAlleSakerToggleEnabled = erFeatureToggleEnabled("melosys.behandle_alle_saker");

  const hentOppgaver = async (value) => {
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

  const hentBruker = async (personIdent) => {
    if (Utils.person.erGyldigFnrEllerDnr(personIdent)) {
      const navn = await hentSammensattNavn(personIdent);
      change("brukerNavn", navn);
    } else {
      change("brukerNavn", null);
    }

    await hentOppgaver(personIdent);
  };

  const hentVirksomhet = async (orgnr) => {
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

  const oppgaverFinnes = radioValg.length > 0;

  const valgbareSakstyper = MKV.KTObjects.sakstyper.filter(
    ({ kode }) =>
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

  const settJournalpostID = (oppgaveID) => {
    const { journalpostID } = oppgaver.find((oppgave) => oppgave.oppgaveID === oppgaveID);
    change("journalpostID", journalpostID);
  };

  // eslint-disable-next-line react/prop-types
  const IdentOgNavn = ({ tittel, feltNavn, label, navn }) => (
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

  return (
    <form className="opprettnysak" onSubmit={handleSubmit}>
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
                      {valgbareSakstyper.map(({ kode, term }) => (
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
                      {hentValgbareBehandlingstema().map(({ kode, term }) => (
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
                    <Skjema.Checkbox
                      className="skalTilordnes"
                      feltNavn="skalTilordnes"
                      label="Legg behandlingen i mine oppgaver"
                    />
                    {error && <Nav.AlertStripeAdvarsel className="formError">{error}</Nav.AlertStripeAdvarsel>}
                    <Knapperad
                      bekreftTekst="Opprett sak"
                      avbryt={tilForsiden}
                      avbrytTekst="Avbryt"
                      redigerbart
                      bekreftRedigerbart={oppgaverFinnes}
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

OpprettNySak.propTypes = {
  form: PT.string.isRequired,
  formValues: PT.object,
  tilForsiden: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
  change: PT.func.isRequired,
  error: PT.string,
  sokOrgnr: PT.func.isRequired,
};

OpprettNySak.defaultProps = {
  formValues: { soknadsinfo: {} },
  error: undefined,
};

const mapStateToProps = (state) => ({
  formValues: getFormValues(KV.Form.OPPRETT_NY_SAK)(state),
  initialValues: {
    skalTilordnes: false,
    behandlingstema: undefined,
    soknadsinfo: { landkoder: [], erUkjenteEllerAlleEosLand: false },
    hovedpart: BRUKER,
  },
});

const mapDispatchToProps = (dispatch) => ({
  sokOrgnr: (orgnr) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const opprettNySak = async (values, dispatch, props) => {
  const soknadErValgt = MKVUtils.erSoknad(values.behandlingstema);
  const fom = soknadErValgt ? Utils.dato.formatterDatoTilISO(values.soknadsinfo.fom) : null;
  const tomErUtfylt = values.soknadsinfo && values.soknadsinfo.tom;
  const tom = tomErUtfylt && soknadErValgt ? Utils.dato.formatterDatoTilISO(values.soknadsinfo.tom) : null;

  const soknadDto = {
    periode: {
      fom,
      tom,
    },
    land: {
      landkoder: soknadErValgt ? values.soknadsinfo.landkoder : [],
      erUkjenteEllerAlleEosLand: soknadErValgt ? values.soknadsinfo.erUkjenteEllerAlleEosLand : false,
    },
  };

  const data = {
    brukerID: values.brukerID,
    sakstype: values.sakstype,
    behandlingstema: values.behandlingstema,
    soknadDto,
    skalTilordnes: values.skalTilordnes,
    oppgaveID: values.oppgaveID,
  };

  try {
    await Api.Fagsaker.fagsak.opprett(data);
    props.tilForsiden();
  } catch (e) {
    if (e.body.message) {
      throw new SubmissionError({ _error: e.body.message });
    }
  }
};

const OpprettNySakForm = reduxForm({
  onSubmit: opprettNySak,
  form: KV.Form.OPPRETT_NY_SAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(opprettNySakSchema),
})(OpprettNySak);

export default connect(mapStateToProps, mapDispatchToProps)(OpprettNySakForm);
