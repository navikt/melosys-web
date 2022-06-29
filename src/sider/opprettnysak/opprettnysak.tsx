import React, { FormEvent, Fragment, useState } from "react";
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

import BrukerNavnSkjema from "../../felleskomponenter/brukerNavnSkjema";
import Knapperad from "../../felleskomponenter/knapperad";
import EnkeltDato from "../../felleskomponenter/datoOmrade/enkeltDato";

import MKV, { Utils as MKVUtils } from "../../melosyskodeverk";
import { lagYupToReduxformErrorMapper } from "../../yup";
import { useFeatureToggle } from "../../featuretoggle";
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
});
const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type OpprettNySakProps = {
  tilForsiden: () => void;
} & PropsFromRedux;

const OpprettNySak = ({
  form,
  formValues,
  tilForsiden,
  change,
  error: formError,
  feilmeldinger,
  opprettSak,
  touchAll,
  formIsValid,
}: InjectedFormProps<KV.Form.OpprettNySakFormData, OpprettNySakProps> & OpprettNySakProps) => {
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [bekreftPending, setBekreftPending] = useState(false);
  const [oppgaverForsoktHentetFraEksisterendePerson, setOppgaverForsoktHentetFraEksisterendePerson] = useState(false);

  const { behandlingstema, soknadsinfo, sakstype } = formValues || {};
  const { landkoder, erUkjenteEllerAlleEosLand } = soknadsinfo || {};
  const soknadErValgt = MKVUtils.erSoknad(behandlingstema);

  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");

  const validerForm = () => {
    touchAll();
    return formIsValid;
  };

  const hentOppgaver = async (brukerID: string) => {
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
        return euEosBehandlingstemaer;
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
                  <Mui.Undertittel
                    tekst="Informasjon om bruker"
                    ikon={Ikoner.AccountCircle}
                    className="undertittel"
                    understrek
                  />
                  <BrukerNavnSkjema className="brukerNavnSkjema innrykk" form={form} onHentBruker={hentOppgaver} />
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
                    {soknadErValgt && (
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
                    {!oppgaverFinnes && !oppgaverForsoktHentetFraEksisterendePerson && (
                      <Nav.AlertStripeInfo>Skriv inn brukers f.nr eller d.nr for å hente oppgaver.</Nav.AlertStripeInfo>
                    )}
                    {!oppgaverFinnes && oppgaverForsoktHentetFraEksisterendePerson && (
                      <Nav.AlertStripeAdvarsel>Det finnes ingen oppgaver på denne personen.</Nav.AlertStripeAdvarsel>
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

const OpprettNySakForm = reduxForm<KV.Form.OpprettNySakFormData, OpprettNySakProps>({
  form: KV.Form.OPPRETT_NY_SAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(opprettNySakSchema),
})(OpprettNySak);

export default connector(OpprettNySakForm);
