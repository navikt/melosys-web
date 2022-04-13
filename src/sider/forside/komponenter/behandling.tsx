import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { reduxForm, InjectedFormProps, getFormValues } from "redux-form";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";

import { RootState } from "AppTypes";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";

import * as Api from "../../../services/api";

import { oppgaverOperations } from "../../../ducks/oppgaver";

import { useAsyncCallbackState } from "../../../hooks";
import "./behandling.css";

const compareTerm = (a: KTObject, b: KTObject) => {
  if (!a.term) return 1;
  if (!b.term) return -1;

  return a.term.localeCompare(b.term);
};

const mapStateToProps = (state: RootState) => ({
  initialValues: {
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  },
  formValues: getFormValues(KV.Form.BEHANDLINGS_FORM)(state) as KV.Form.BehandlingsFormData,
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type BehandlingProps = PropsFromRedux & RouteComponentProps;

export const Behandling = ({
  handleSubmit,
  history,
  formValues,
  change,
  initialValues,
}: InjectedFormProps<KV.Form.BehandlingsFormData, BehandlingProps> & BehandlingProps) => {
  const [statistikk] = useAsyncCallbackState(Api.Statistikk.hent, { aapneBehandlinger: {} }, []);

  useEffect(() => {
    if (formValues?.sakstype) {
      change(
        "behandlingstema",
        formValues.sakstype === MKV.Koder.sakstyper.EU_EOS
          ? initialValues.behandlingstema
          : MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
      );
    }
  }, [formValues?.sakstype]);

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

  const ikkePlukkbareBehandlingstemaerEOS = [
    MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET,
    MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  ];
  const plukkbareBehandlingstemaerTrygdeavtale = [MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV];

  const behandlingstemaErPlukkbart = (behandlingtemaKTObject: KTObject) => {
    return formValues?.sakstype === MKV.Koder.sakstyper.EU_EOS
      ? !ikkePlukkbareBehandlingstemaerEOS.includes(behandlingtemaKTObject.kode)
      : plukkbareBehandlingstemaerTrygdeavtale.includes(behandlingtemaKTObject.kode);
  };

  return (
    <Nav.Panel className="forside__sidepanel sidepanel__behandling">
      <Nav.Typo.Systemtittel>Behandle sak</Nav.Typo.Systemtittel>
      <p>Velg sakstype og behandlingstema for å få tildelt en sak.</p>
      <form className="behandling__skjema" onSubmit={submitOgVideresend}>
        <Nav.Row>
          <Nav.Column xs="12">
            <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
              <option key={MKV.Koder.sakstyper.EU_EOS} value={MKV.Koder.sakstyper.EU_EOS}>
                {MKV.Terms.sakstyper.EU_EOS}
              </option>
              <option key={MKV.Koder.sakstyper.TRYGDEAVTALE} value={MKV.Koder.sakstyper.TRYGDEAVTALE}>
                {MKV.Terms.sakstyper.TRYGDEAVTALE}
              </option>
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column xs="12">
            <Skjema.Select feltNavn="behandlingstema" bredde="fullbredde" label="Behandlingstema">
              {MKV.KTObjects.behandlinger.behandlingstema
                .filter(behandlingstemaErPlukkbart)
                .sort(compareTerm)
                .map(({ kode, term }: KTObject) => {
                  const antallAapneBehandlinger = statistikk.aapneBehandlinger[kode] || 0;
                  return (
                    <option key={kode} value={kode}>
                      {term}&nbsp;&nbsp;({antallAapneBehandlinger})
                    </option>
                  );
                })}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        <Nav.Knapp className="behandling__knapp">Behandle sak</Nav.Knapp>
      </form>
    </Nav.Panel>
  );
};

const BehandlingForm = reduxForm<KV.Form.BehandlingsFormData, BehandlingProps>({
  form: KV.Form.BEHANDLINGS_FORM,
  destroyOnUnmount: false,
  onSubmit: (values: KV.Form.BehandlingsFormData) => oppgaverOperations.sendBehandlingsOppgave(values),
})(Behandling);

export default withRouter(connector(BehandlingForm));
