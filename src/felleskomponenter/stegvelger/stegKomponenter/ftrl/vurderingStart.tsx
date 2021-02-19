import React, { Fragment, useEffect, useState } from "react";
import { getFormValues, reduxForm } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { AlertStripeFeil } from "nav-frontend-alertstriper";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../skjema";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";

import { modalerOperations } from "../../../../ducks/modaler";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";

import "./vurderingStart.css";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";

const mapStateToProps = (state: RootState) => {
  const initialSoknadsperiode = behandlingsgrunnlagSelectors.PeriodeSelector(state);
  const initialSoeknadsland = behandlingsgrunnlagSelectors.SoknadslandSelector(state);
  const initialTrygdedekning = behandlingsgrunnlagSelectors.TrygdedekningSelector(state);
  return {
    trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
    formValues: getFormValues(KV.Form.START)(state),
    initialValues: {
      fom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.fom),
      tom: initialSoknadsperiode && Utils.dato.formatterDatoTilNorsk(initialSoknadsperiode.tom),
      land: initialSoeknadsland && initialSoeknadsland.toString(),
      trygdedekning: initialTrygdedekning,
    },
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visOppfriskDialogOgFortsettHandle: (fortsett: () => void) =>
    dispatch(modalerOperations.visOppfriskOgFortsett(fortsett)),
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: { fom: string; tom: string }) =>
    dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadsland: (soeknadsland: string[]) =>
    dispatch(behandlingsgrunnlagOperations.oppdaterSoeknadsland(soeknadsland)),
  oppdaterTrygdedekning: (trygdedekning: string) =>
    dispatch(behandlingsgrunnlagOperations.oppdaterTrygdedekning(trygdedekning)),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  redigerbart: boolean;
  oppdaterData: (avklartefakta: any) => void;
  alleLandkoder: KTObject[];
  formValues: { fom?: string; tom?: string; land?: string; trygdedekning?: string };
}

const VurderingStart = ({
  bekreft,
  redigerbart,
  formValues = {},
  alleLandkoder,
  visOppfriskDialogOgFortsettHandle,
  visMenypanel,
  oppdater,
  oppdaterPeriode,
  oppdaterSoeknadsland,
  oppdaterTrygdedekning,
  trygdedekninger,
  lagreBehandlingsgrunnlag,
  initialValues,
}: Props & PropsFromRedux) => {
  const [erPeriodeGyldig, setErPeriodeGyldig] = useState(true);
  const [erObligatoriskeFelterFyltInn, setErObligatoriskeFelterFyltInn] = useState(false);
  const [initialFomTom, setInitialFomTom] = useState<{ fom: string | undefined; tom: string | undefined }>({
    fom: undefined,
    tom: undefined,
  });

  const hjelpetekst = "Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet.";
  const Hjelpetekst = () => (
    <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
      {hjelpetekst}
    </Nav.Hjelpetekst>
  );

  useEffect(() => {
    if (initialValues && initialValues.fom && !Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
      setInitialFomTom({ fom: initialValues.fom, tom: initialValues.tom });
    }
  }, []);

  const oppdaterLokalBehandlingsgrunnlag = async (erFelteneGyldig: boolean) => {
    const fom = Utils.dato.formatterDatoTilISO(formValues.fom);
    const tom = Utils.dato.formatterDatoTilISO(formValues.tom);
    await Promise.all([
      oppdaterPeriode({ fom: fom === "Invalid date" ? "" : fom, tom: tom === "Invalid date" ? "" : tom }),
      oppdaterSoeknadsland(formValues.land ? [formValues.land] : []),
      oppdaterTrygdedekning(formValues.trygdedekning ? formValues.trygdedekning : ""),
    ]);
    oppdater();
    if (erFelteneGyldig) {
      lagreBehandlingsgrunnlag();
    }
  };

  useEffect(() => {
    const erTomNullEllerEtterFom = !formValues.tom || Utils.dato.erGyldigPeriode(formValues.fom, formValues.tom);
    setErPeriodeGyldig(erTomNullEllerEtterFom);

    const erFelteneGyldig =
      !!formValues.land && !!formValues.trygdedekning && !!formValues.fom && erTomNullEllerEtterFom;
    setErObligatoriskeFelterFyltInn(erFelteneGyldig);

    oppdaterLokalBehandlingsgrunnlag(erFelteneGyldig);
  }, [formValues]);

  const fortsettHandle = () => {
    oppdaterLokalBehandlingsgrunnlag(erObligatoriskeFelterFyltInn);
    if (erObligatoriskeFelterFyltInn) {
      if (formValues.fom !== initialFomTom.fom || formValues.tom !== initialFomTom.tom) {
        setInitialFomTom({ fom: formValues.fom, tom: formValues.tom });
        visOppfriskDialogOgFortsettHandle(() => {
          bekreft();
          visMenypanel();
        });
      } else {
        bekreft();
      }
    }
  };

  return (
    <div className="vurderingStart">
      <Nav.typo.Undertittel className="undertittel">Oppgi søknadsperiode og -land</Nav.typo.Undertittel>

      <Nav.Fieldset legend="Periode" onSubmit={fortsettHandle}>
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Input datoFelt label="Fra og med:" feltNavn="fom" bredde="fullbredde" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Input datoFelt label="Til og med:" feltNavn="tom" bredde="fullbredde" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="5">
            <Skjema.Select
              label={
                <Fragment>
                  <b>Arbeidsland</b>
                  <Hjelpetekst />
                </Fragment>
              }
              feltNavn="land"
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.land}
            >
              {alleLandkoder.map((item) => (
                <option key={item.kode} value={item.kode}>
                  {Utils.land.landTekstFormatStoreForbokstaver(item)}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        {!erPeriodeGyldig && (
          <AlertStripeFeil className="alert">
            Til og med dato kan ikke være tidligere enn fra og med dato.
          </AlertStripeFeil>
        )}
      </Nav.Fieldset>
      <Nav.Fieldset legend="Trygdedekning">
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Select
              label=""
              feltNavn="trygdedekning"
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.trygdedekning}
            >
              {trygdedekninger.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <div className="fane__knapplinje">
        <Nav.Hovedknapp
          mini
          disabled={!erObligatoriskeFelterFyltInn}
          className="fane__navigasjonsknapp"
          onClick={fortsettHandle}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingStartForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.START,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingStart);

export default connector(VurderingStartForm);
