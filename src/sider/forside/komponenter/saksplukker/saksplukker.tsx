import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, InjectedFormProps, reduxForm } from "redux-form";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";

import { oppgaverOperations } from "../../../../ducks/oppgaver";
import { useFeatureToggle } from "../../../../featuretoggle";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import saksplukkerSchema from "./saksplukkerSchema";
import "./saksplukker.css";

const { EU_EOS, TRYGDEAVTALE, FTRL } = MKV.Koder.sakstyper;

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
  initialValues: {
    sakstype: EU_EOS,
  },
  formValues: getFormValues(KV.Form.SAKSPLUKKER_FORM)(state) as SaksplukkerFormData,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SaksplukkerProps = PropsFromRedux & RouteComponentProps;

export const Saksplukker = ({
  handleSubmit,
  history,
  formValues,
  change,
  invalid,
}: InjectedFormProps<SaksplukkerFormData, SaksplukkerProps> & SaksplukkerProps) => {
  const sakstemaToggle = useFeatureToggle("melosys.sakstema");
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");

  useEffect(() => {
    if (formValues?.sakstype) {
      if (sakstemaToggle === "enabled") {
        change("sakstema", null);
        change("behandlingstema", null);
      } else {
        change(
          "behandlingstema",
          formValues.sakstype === EU_EOS
            ? MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER
            : MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
        );
      }
    }
  }, [formValues?.sakstype, sakstemaToggle]);

  const submitOgVideresend = async (form: any) => {
    const redirectURL = await handleSubmit(form);

    /* eslint-disable no-alert */
    if (!redirectURL) {
      return alert("Ingen oppgaver finnes");
    }
    /* eslint-enable */
    history.push(redirectURL);
    return true;
  };

  const nullstill = () => {
    change("sakstype", null);
    change("sakstema", null);
    change("behandlingstema", null);
  };

  const sakstemaErPlukkbart = (sakstemaKTObject: KTObject) => {
    return MKV.Kodekombinasjoner.gyldigeSakstema(formValues?.sakstype).includes(sakstemaKTObject.kode);
  };

  const ikkePlukkbareBehandlingstemaerEOS = [
    MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET,
    MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  ];
  const plukkbareBehandlingstemaerTrygdeavtale = [MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV];

  const behandlingstemaErPlukkbart = (behandlingtemaKTObject: KTObject) => {
    if (sakstemaToggle === "enabled") {
      return MKV.Kodekombinasjoner.gyldigeBehandlingstema(formValues?.sakstype, formValues?.sakstema).includes(
        behandlingtemaKTObject.kode
      );
    }
    return formValues?.sakstype === EU_EOS
      ? !ikkePlukkbareBehandlingstemaerEOS.includes(behandlingtemaKTObject.kode)
      : plukkbareBehandlingstemaerTrygdeavtale.includes(behandlingtemaKTObject.kode);
  };

  return (
    <Nav.Panel className="forside__sidepanel saksplukker">
      <Nav.Typo.Systemtittel>Behandle sak</Nav.Typo.Systemtittel>
      {sakstemaToggle === "enabled" ? (
        <p>Velg sakstype, saks- og behandlingstema for å få tildelt en sak.</p>
      ) : (
        <p>Velg sakstype og behandlingstema for å få tildelt en sak.</p>
      )}
      <form className="saksplukker__skjema" onSubmit={submitOgVideresend} onReset={nullstill}>
        <Nav.Row>
          <Nav.Column xs="12">
            <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
              <option key={EU_EOS} value={EU_EOS} label={MKV.Terms.sakstyper.EU_EOS} />
              <option key={TRYGDEAVTALE} value={TRYGDEAVTALE} label={MKV.Terms.sakstyper.TRYGDEAVTALE} />
              {folketrygdenToggle === "enabled" && <option key={FTRL} value={FTRL} label={MKV.Terms.sakstyper.FTRL} />}
            </Skjema.Select>
          </Nav.Column>
          {sakstemaToggle === "enabled" && (
            <Nav.Column xs="12">
              <Skjema.Select feltNavn="sakstema" bredde="fullbredde" label="Sakstema">
                {MKV.KTObjects.sakstemaer.filter(sakstemaErPlukkbart).map(({ kode, term }: KTObject) => (
                  <option key={kode} value={kode}>
                    {term}
                  </option>
                ))}
              </Skjema.Select>
            </Nav.Column>
          )}
          <Nav.Column xs="12">
            <Skjema.Select feltNavn="behandlingstema" bredde="fullbredde" label="Behandlingstema">
              {MKV.KTObjects.behandlinger.behandlingstema
                .filter(behandlingstemaErPlukkbart)
                .sort(compareTerm)
                .map(({ kode, term }: KTObject) => (
                  <option key={kode} value={kode}>
                    {term}
                  </option>
                ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="saksplukker__knapperad">
          <Nav.Knapp className="saksplukker__knapp" disabled={invalid}>
            Behandle sak
          </Nav.Knapp>
          <Nav.Flatknapp htmlType="reset">Nullstill</Nav.Flatknapp>
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
