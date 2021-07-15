import React, { Fragment, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { reduxForm, getFormValues, FormSection, SubmissionError } from "redux-form";

import * as Nav from "../../utils/navFrontend";
import * as Skjema from "../../felleskomponenter/skjema";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";

import Brukernavnskjema from "../../felleskomponenter/brukernavnskjema";
import Knapperad from "../../felleskomponenter/knapperad";
import EnkeltDato from "../../felleskomponenter/datoOmrade/enkeltDato";

import MKV, { Utils as MKVUtils } from "../../melosyskodeverk";
import { lagYupToReduxformErrorMapper } from "../../yup";
import opprettNySakSchema from "./opprettnysakSchema";

import "./opprettnysak.css";
import { FeatureToggle } from "../../featuretoggle";

const OpprettNySak = ({ form, formValues, tilForsiden, handleSubmit, change, error }) => {
  const [oppgaver, setOppgaver] = useState([]);
  const [oppgaverForsoktHentetFraEksisterendePerson, setOppgaverForsoktHentetFraEksisterendePerson] = useState(false);

  const { behandlingstema, soknadsinfo } = formValues;
  const { land, erUkjenteEllerAlleEosLand } = soknadsinfo || { land: null, erUkjenteEllerAlleEosLand: null };
  const soknadErValgt = MKVUtils.erSoknad(behandlingstema);

  const hentOppgaver = async (brukerID) => {
    if (Utils.person.erGyldigFnr(brukerID) || Utils.person.erGyldigDnr(brukerID)) {
      try {
        const oppgaverResponse = await Api.Oppgaver.sok(brukerID);
        setOppgaver(oppgaverResponse);
        setOppgaverForsoktHentetFraEksisterendePerson(true);
      } catch (e) {
        setOppgaver([]);
      }
    } else {
      setOppgaver([]);
      setOppgaverForsoktHentetFraEksisterendePerson(false);
    }
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

  const oppgaverFinnes = radioValg.length > 0;

  const filtrerteBehandlingstemaer = MKV.KTObjects.behandlinger.behandlingstema
    .filter(({ kode }) => MKVUtils.erSoknad(kode) || MKVUtils.erSedForesporsel(kode))
    .filter(
      ({ kode }) =>
        kode !== MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND &&
        kode !== MKV.Koder.behandlinger.behandlingstema.TRYGDETID
    );

  const settJournalpostID = (oppgaveID) => {
    const { journalpostID } = oppgaver.find((oppgave) => oppgave.oppgaveID === oppgaveID);
    change("journalpostID", journalpostID);
  };

  const erLandvelgerDisabled =
    erUkjenteEllerAlleEosLand && behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;

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
                  <Mui.Undertittel
                    tekst="Informasjon om bruker"
                    ikon={Ikoner.AccountCircle}
                    className="undertittel"
                    understrek
                  />
                  <Brukernavnskjema className="brukernavnskjema innrykk" form={form} onHentBruker={hentOppgaver} />
                  <Mui.Undertittel
                    tekst="Informasjon om sak"
                    ikon={Ikoner.Filenew}
                    className="undertittel"
                    understrek
                  />
                  <div className="innrykk">
                    <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
                      {MKV.KTObjects.sakstyper
                        .filter(({ kode }) => kode === MKV.Koder.sakstyper.EU_EOS)
                        .map(({ kode, term }) => (
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
                      {filtrerteBehandlingstemaer.map(({ kode, term }) => (
                        <option key={kode} value={kode}>
                          {term}
                        </option>
                      ))}
                    </Skjema.Select>
                    {soknadErValgt && (
                      <Fragment>
                        <Nav.Typo.Normaltekst>Søknadsperiode</Nav.Typo.Normaltekst>
                        <FormSection name="soknadsinfo">
                          <Nav.Row>
                            <Nav.Column xs="5">
                              <FeatureToggle togglename="melosys.input.DATOFELT">
                                {(status) =>
                                  status === "enabled" ? (
                                    <Skjema.Datovelger label="Fra" feltNavn="fom" />
                                  ) : (
                                    <Skjema.Input datoFelt feltNavn="fom" label="Fra" />
                                  )
                                }
                              </FeatureToggle>
                            </Nav.Column>
                            <Nav.Column xs="5">
                              <FeatureToggle togglename="melosys.input.DATOFELT">
                                {(status) =>
                                  status === "enabled" ? (
                                    <Skjema.Datovelger label="Til" feltNavn="tom" />
                                  ) : (
                                    <Skjema.Input datoFelt feltNavn="tom" label="Til" />
                                  )
                                }
                              </FeatureToggle>
                            </Nav.Column>
                          </Nav.Row>
                          <Skjema.LandVelger
                            multiLand
                            feltNavn="land"
                            label="Land"
                            errorConfig={{ submitFailed: true }}
                            disabled={erLandvelgerDisabled}
                          />
                          {behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
                            <Skjema.Checkbox
                              feltNavn="erUkjenteEllerAlleEosLand"
                              disabled={land?.length > 0}
                              label={
                                <div>
                                  Flere EØS-land/Sveits. Ikke kjent hvilke
                                  <Nav.Hjelpetekst
                                    className="hjelpetekst"
                                    tittel="tittel"
                                    type={Nav.PopoverOrientering.Hoyre}
                                  >
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
                    {!oppgaverFinnes && !oppgaverForsoktHentetFraEksisterendePerson && (
                      <Nav.AlertStripeInfo>Skriv inn brukers f.nr eller d.nr for å hente oppgaver.</Nav.AlertStripeInfo>
                    )}
                    {!oppgaverFinnes && oppgaverForsoktHentetFraEksisterendePerson && (
                      <Nav.AlertStripeAdvarsel>Det finnes ingen oppgaver på denne personen.</Nav.AlertStripeAdvarsel>
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
};

OpprettNySak.defaultProps = {
  formValues: {},
  error: undefined,
};

const mapStateToProps = (state) => ({
  formValues: getFormValues(KV.Form.OPPRETT_NY_SAK)(state),
  initialValues: {
    skalTilordnes: false,
  },
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
      landkoder: soknadErValgt ? values.soknadsinfo.land : [],
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

export default connect(mapStateToProps)(OpprettNySakForm);
