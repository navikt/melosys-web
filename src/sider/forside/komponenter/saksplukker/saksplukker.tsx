import React, { useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch } from "react-redux";
import { clearFields, getFormValues, InjectedFormProps, reduxForm } from "redux-form";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { AlertStripeAdvarsel } from "nav-frontend-alertstriper";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import saksplukkerSchema from "./saksplukkerSchema";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Api from "../../../../services/api";

import { oppgaverOperations } from "../../../../ducks/oppgaver";
import { useFeatureToggle } from "../../../../featuretoggle";
import { lagYupToReduxformErrorMapper } from "../../../../yup";

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
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");

  const [muligeSakstyper, setMuligeSakstyper] = useState([]);
  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [visIngenOppgaveFunnetAlert, setVisIngenOppgaveFunnetAlert] = useState(false);

  const dispatch = useDispatch();
  const { sakstype, sakstema } = formValues || {};

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    Api.LovligeKombinasjoner.hentSakstyper().then((lovligeSakstyper) => {
      setMuligeSakstyper(lovligeSakstyper);
    });
  }, [behandleAlleSakerToggle]);

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    if (sakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(null, sakstype).then((lovligeSakstemaer) => {
        setMuligeSakstemaer(lovligeSakstemaer);
      });
    }
  }, [behandleAlleSakerToggle, sakstype]);

  useEffect(() => {
    if (behandleAlleSakerToggle !== "enabled") return;

    if (sakstema && sakstype) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(null, sakstype, sakstema).then((lovligeBehandlingstemaer) => {
        setMuligeBehandlingstemaer(lovligeBehandlingstemaer);
      });
    }
  }, [behandleAlleSakerToggle, sakstype, sakstema]);

  useEffect(() => {
    if (sakstype) {
      if (behandleAlleSakerToggle === "enabled") {
        change("sakstema", null);
        change("behandlingstema", null);
      } else {
        change(
          "behandlingstema",
          sakstype === EU_EOS
            ? MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER
            : MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
        );
      }
    }
  }, [sakstype, behandleAlleSakerToggle]);

  useEffect(() => {
    if (sakstema) {
      if (behandleAlleSakerToggle === "enabled") {
        change("behandlingstema", null);
      }
    }
  }, [sakstema, behandleAlleSakerToggle]);

  const submitOgVideresend = async (form: any) => {
    const redirectURL = await handleSubmit(form);

    if (!redirectURL) {
      setVisIngenOppgaveFunnetAlert(true);
      return false;
    }
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
    return sakstype === EU_EOS
      ? !ikkePlukkbareBehandlingstemaerEOS.includes(behandlingtemaKTObject.kode)
      : plukkbareBehandlingstemaerTrygdeavtale.includes(behandlingtemaKTObject.kode);
  };

  const nullstillForm = () =>
    dispatch(clearFields(KV.Form.SAKSPLUKKER_FORM, false, false, "sakstype", "sakstema", "behandlingstema"));

  const behandleFagsakMarginToggle = behandleAlleSakerToggle === "enabled" ? "4" : "6";

  return (
    <Nav.Panel className="forside__sidepanel saksplukker">
      <Nav.Typo.Systemtittel>Behandle sak</Nav.Typo.Systemtittel>
      {behandleAlleSakerToggle === "enabled" ? (
        <p>Velg sakstype, saks- og behandlingstema for å få tildelt en sak.</p>
      ) : (
        <p>Velg sakstype og behandlingstema for å få tildelt en sak.</p>
      )}
      <form className="saksplukker__skjema" onSubmit={submitOgVideresend}>
        <Nav.Row>
          <Nav.Column md="12" lg={behandleFagsakMarginToggle}>
            <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
              {behandleAlleSakerToggle === "enabled" ? (
                muligeSakstyper.map(({ kode, term }: KTObject) => (
                  <option key={kode} value={kode}>
                    {term}
                  </option>
                ))
              ) : (
                <>
                  <option key={EU_EOS} value={EU_EOS} label={MKV.Terms.sakstyper.EU_EOS} />
                  <option key={TRYGDEAVTALE} value={TRYGDEAVTALE} label={MKV.Terms.sakstyper.TRYGDEAVTALE} />
                  {folketrygdenToggle === "enabled" && (
                    <option key={FTRL} value={FTRL} label={MKV.Terms.sakstyper.FTRL} />
                  )}
                </>
              )}
            </Skjema.Select>
          </Nav.Column>
          {behandleAlleSakerToggle === "enabled" && (
            <Nav.Column md="12" lg="4">
              <Skjema.Select feltNavn="sakstema" bredde="fullbredde" label="Sakstema">
                {muligeSakstemaer.map(({ kode, term }: KTObject) => (
                  <option key={kode} value={kode}>
                    {term}
                  </option>
                ))}
              </Skjema.Select>
            </Nav.Column>
          )}
          <Nav.Column md="12" lg={behandleFagsakMarginToggle}>
            <Skjema.Select feltNavn="behandlingstema" bredde="fullbredde" label="Behandlingstema">
              {(behandleAlleSakerToggle === "enabled"
                ? muligeBehandlingstemaer
                : MKV.KTObjects.behandlinger.behandlingstema.filter(behandlingstemaErPlukkbart)
              )
                .sort(compareTerm)
                .map(({ kode, term }: KTObject) => (
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
              <AlertStripeAdvarsel>Det fins ingen saker for valgt type/tema kombinasjon</AlertStripeAdvarsel>
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row className="saksplukker__knapperad">
          <Nav.Knapp className="saksplukker__knapp" disabled={invalid}>
            Behandle sak
          </Nav.Knapp>
          {behandleAlleSakerToggle === "enabled" && <Nav.Flatknapp onClick={nullstillForm}>Nullstill</Nav.Flatknapp>}
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
