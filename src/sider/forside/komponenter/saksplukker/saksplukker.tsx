import { FormEvent, MouseEvent, useEffect, useState } from "react";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { clearFields, getFormValues, InjectedFormProps, reduxForm, touch } from "redux-form";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Api from "../../../../services/api";
import * as Routing from "../../../../url";
import { oppgaverOperations } from "../../../../ducks/oppgaver";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import saksplukkerSchema from "./saksplukkerSchema";
import "./saksplukker.css";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_ARBEID_KUN_NORGE } from "../../../../featuretoggle/toggleNavn";

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
  touchField: (felt: string) => dispatch(touch(KV.Form.SAKSPLUKKER_FORM, felt)),
  nullstillForm: () =>
    dispatch(clearFields(KV.Form.SAKSPLUKKER_FORM, false, false, "sakstype", "sakstema", "behandlingstema")),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SaksplukkerProps = PropsFromRedux & RouteComponentProps;

export const Saksplukker = ({
  history,
  formValues,
  change,
  nullstillForm,
  invalid,
  touchField,
}: InjectedFormProps<SaksplukkerFormData, SaksplukkerProps> & SaksplukkerProps) => {
  const [muligeSakstyper, setMuligeSakstyper] = useState([]);
  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [visIngenOppgaveFunnetAlert, setVisIngenOppgaveFunnetAlert] = useState(false);
  const [antallOppgaver, setAntallOppgaver] = useState(0);
  const erArbeidKunNorgeToggleEnabled = useFeatureToggle(MELOSYS_ARBEID_KUN_NORGE);

  const { sakstype, sakstema } = formValues || {};

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

  const submitOgVideresend = async (event: FormEvent) => {
    event.preventDefault();

    if (invalid) {
      touchField("sakstype");
      touchField("sakstema");
      touchField("behandlingstema");
    } else {
      const response = await oppgaverOperations.plukkSak(formValues);
      const { saksnummer, behandlingID, behandlingstema, behandlingstype, antallUtildelteOppgaver } = response;

      if (!saksnummer) {
        setAntallOppgaver(antallUtildelteOppgaver);
        setVisIngenOppgaveFunnetAlert(true);
      } else {
        const redirectURL = Routing.lagUrl(
          saksnummer,
          behandlingID,
          formValues.sakstype,
          formValues.sakstema,
          behandlingstema,
          behandlingstype,
          erArbeidKunNorgeToggleEnabled,
        );

        history.push(redirectURL);
      }
    }
  };

  const nullstill = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setVisIngenOppgaveFunnetAlert(false);
    nullstillForm();
  };

  return (
    <div className="panel saksplukker">
      <Nav.Heading size="small">Behandle sak</Nav.Heading>
      <p>Velg sakstype, saks- og behandlingstema for å få tildelt en sak.</p>

      <form className="saksplukker__skjema" onSubmit={submitOgVideresend}>
        <Nav.Row>
          <Nav.Column md="12" lg="4">
            <Skjema.Select feltNavn="sakstype" label="Sakstype">
              {muligeSakstyper.map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column md="12" lg="4">
            <Skjema.Select feltNavn="sakstema" label="Sakstema">
              {muligeSakstemaer.map(({ kode, term }: KTObject) => (
                <option key={kode} value={kode}>
                  {term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column md="12" lg="4">
            <Skjema.Select feltNavn="behandlingstema" label="Behandlingstema">
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
              <Nav.Alert variant="warning">
                Det fins ingen saker for valgt type/tema kombinasjon blant de {antallOppgaver} eldste sakene
              </Nav.Alert>
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row className="saksplukker__knapperad">
          <Nav.Column xs="12">
            <Nav.Button variant="secondary">Behandle sak</Nav.Button>
            <Nav.Button variant="tertiary" onClick={nullstill}>
              Nullstill
            </Nav.Button>
          </Nav.Column>
        </Nav.Row>
      </form>
    </div>
  );
};

const SaksplukkerForm = reduxForm<SaksplukkerFormData, SaksplukkerProps>({
  form: KV.Form.SAKSPLUKKER_FORM,
  destroyOnUnmount: false,
  validate: lagYupToReduxformErrorMapper(saksplukkerSchema),
  touchOnBlur: false,
})(Saksplukker);

export default withRouter(connector(SaksplukkerForm));
