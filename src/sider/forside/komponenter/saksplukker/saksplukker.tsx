import { useEffect, useState } from "react";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { clearFields, getFormValues, InjectedFormProps, reduxForm } from "redux-form";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { AlertStripeAdvarsel } from "nav-frontend-alertstriper";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Api from "../../../../services/api";
import * as Routing from "../../../../url";

import { useFeatureToggle } from "../../../../featuretoggle";
import { oppgaverOperations } from "../../../../ducks/oppgaver";
import {
  MELOSYS_FOLKETRYGDEN_MVP,
  MELOSYS_FTRL_IKKE_YRKESAKTIV,
  MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING,
} from "../../../../featuretoggle/toggleNavn";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import saksplukkerSchema from "./saksplukkerSchema";
import "./saksplukker.css";

const compareTerm = (a: KTObject, b: KTObject) => {
  if (!a.term) return 1;
  if (!b.term) return -1;

  return a.term.localeCompare(b.term);
};

export interface SaksplukkerFormData {
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
}

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.SAKSPLUKKER_FORM)(state) as SaksplukkerFormData,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  nullstillForm: () =>
    dispatch(clearFields(KV.Form.SAKSPLUKKER_FORM, false, false, "sakstype", "sakstema", "behandlingstema")),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SaksplukkerProps = PropsFromRedux & RouteComponentProps;

export const Saksplukker = ({
  handleSubmit,
  history,
  formValues,
  change,
  nullstillForm,
  invalid,
}: InjectedFormProps<SaksplukkerFormData, SaksplukkerProps> & SaksplukkerProps) => {
  const [muligeSakstyper, setMuligeSakstyper] = useState([]);
  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [visIngenOppgaveFunnetAlert, setVisIngenOppgaveFunnetAlert] = useState(false);
  const [antallOppgaver, setAntallOppgaver] = useState(0);

  const { sakstype, sakstema } = formValues || {};

  const folketrygdenToggleEnabled = useFeatureToggle(MELOSYS_FOLKETRYGDEN_MVP);
  const manglendeInnbetalingToggleEnabled = useFeatureToggle(MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING);
  const ikkeYrkesaktivFtrlToggleEnabled = useFeatureToggle(MELOSYS_FTRL_IKKE_YRKESAKTIV);

  useEffect(() => {
    Api.LovligeKombinasjoner.hentSakstyper().then((lovligeSakstyper) => {
      setMuligeSakstyper(lovligeSakstyper);
    });
  }, []);

  useEffect(() => {
    if (sakstype) {
      change("sakstema", null);
      change("behandlingstema", null);
      Api.LovligeKombinasjoner.hentSakstemaer(null, sakstype).then((lovligeSakstemaer) => {
        setMuligeSakstemaer(lovligeSakstemaer);
      });
    }
  }, [sakstype]);

  useEffect(() => {
    if (sakstema && sakstype) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(null, sakstype, sakstema).then((lovligeBehandlingstemaer) => {
        setMuligeBehandlingstemaer(lovligeBehandlingstemaer);
      });
    }
  }, [sakstype, sakstema]);

  useEffect(() => {
    if (sakstema) {
      change("behandlingstema", null);
    }
  }, [sakstema]);

  const submitOgVideresend = async (form: any) => {
    const response = await handleSubmit(form);
    const { saksnummer, behandlingID, behandlingstema, behandlingstype, antallUtildelteOppgaver } = response;
    if (!saksnummer) {
      setAntallOppgaver(antallUtildelteOppgaver);
      setVisIngenOppgaveFunnetAlert(true);
      return false;
    }

    const redirectURL = Routing.lagUrl(
      saksnummer,
      behandlingID,
      formValues.sakstype,
      formValues.sakstema,
      behandlingstema,
      behandlingstype,
      folketrygdenToggleEnabled,
      manglendeInnbetalingToggleEnabled,
      ikkeYrkesaktivFtrlToggleEnabled
    );

    history.push(redirectURL);
    return true;
  };

  return (
    <Nav.Panel className="forside__sidepanel saksplukker">
      <Nav.Typo.Systemtittel>Behandle sak</Nav.Typo.Systemtittel>
      <p>Velg sakstype, saks- og behandlingstema for å få tildelt en sak.</p>

      <form className="saksplukker__skjema" onSubmit={submitOgVideresend}>
        <Nav.Row>
          <Nav.Column md="12" lg="4">
            <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
              {muligeSakstyper.map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column md="12" lg="4">
            <Skjema.Select feltNavn="sakstema" bredde="fullbredde" label="Sakstema">
              {muligeSakstemaer.map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column md="12" lg="4">
            <Skjema.Select feltNavn="behandlingstema" bredde="fullbredde" label="Behandlingstema">
              {muligeBehandlingstemaer.sort(compareTerm).map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        {visIngenOppgaveFunnetAlert && (
          <Nav.Row>
            <Nav.Column md="12">
              <AlertStripeAdvarsel>
                Det fins ingen saker for valgt type/tema kombinasjon blant de {antallOppgaver} eldste sakene
              </AlertStripeAdvarsel>
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row className="saksplukker__knapperad">
          <Nav.Knapp className="saksplukker__knapp" disabled={invalid}>
            Behandle sak
          </Nav.Knapp>
          <Nav.Flatknapp onClick={nullstillForm}>Nullstill</Nav.Flatknapp>
        </Nav.Row>
      </form>
    </Nav.Panel>
  );
};

const SaksplukkerForm = reduxForm<SaksplukkerFormData, SaksplukkerProps>({
  form: KV.Form.SAKSPLUKKER_FORM,
  destroyOnUnmount: false,
  onSubmit: (values: SaksplukkerFormData) => oppgaverOperations.plukkSak(values),
  validate: lagYupToReduxformErrorMapper(saksplukkerSchema),
})(Saksplukker);

export default withRouter(connector(SaksplukkerForm));
