import React, { Fragment, useCallback, useEffect, useState } from "react";
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

import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { formSelectors } from "../../../../ducks/form";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingStartSchema from "./vurderingStartSchema";
import DialogboksOppfriskSak from "../../../dialogboks/dialogboksOppfrisk";

import "./vurderingStart.css";

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
    formIsValid: formSelectors.VurderStartFormValid(state),
    erPeriodeGyldig: formSelectors.VurderStartPeriodeValid(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
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

interface FormValuesProp {
  fom?: string;
  tom?: string;
  land?: string;
  trygdedekning?: string;
}

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  redigerbart: boolean;
  oppdaterData: (avklartefakta: any) => void;
  alleLandkoder: KTObject[];
  formValues: FormValuesProp;
  tilForsiden: () => void;
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: () => void;
  annenBehandlingOppfriskes: boolean;
}

const VurderingStart = ({
  bekreft,
  redigerbart,
  formValues = {},
  alleLandkoder,
  oppdater,
  oppdaterPeriode,
  oppdaterSoeknadsland,
  oppdaterTrygdedekning,
  trygdedekninger,
  lagreBehandlingsgrunnlag,
  formIsValid,
  erPeriodeGyldig,
  initialValues,
  tilForsiden,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
  annenBehandlingOppfriskes,
  visMenypanel,
}: Props & PropsFromRedux) => {
  const [initialFomTom, setInitialFomTom] = useState<{ fom: string | undefined; tom: string | undefined }>({
    fom: undefined,
    tom: undefined,
  });
  const [visOppfrisk, setVisOppfrisk] = useState(false);
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

  const oppdaterLokalBehandlingsgrunnlag = async (data: { formValues: FormValuesProp; formIsValid: boolean }) => {
    const fom = Utils.dato.formatterDatoTilISO(data.formValues.fom);
    const tom = Utils.dato.formatterDatoTilISO(data.formValues.tom);
    await Promise.all([
      oppdaterPeriode({ fom: fom === "Invalid date" ? "" : fom, tom: tom === "Invalid date" ? "" : tom }),
      oppdaterSoeknadsland(data.formValues.land ? [data.formValues.land] : []),
      oppdaterTrygdedekning(data.formValues.trygdedekning ? data.formValues.trygdedekning : ""),
    ]);
    oppdater();
    if (data.formIsValid) {
      lagreBehandlingsgrunnlag();
    }
  };

  const debouncedOppdatering = useCallback(Utils._debounce(oppdaterLokalBehandlingsgrunnlag, 500), []);

  useEffect(() => {
    debouncedOppdatering({ formValues, formIsValid });
  }, [formIsValid, formValues]);

  const fortsettHandle = () => {
    if (formValues.fom !== initialFomTom.fom || formValues.tom !== initialFomTom.tom) {
      setInitialFomTom({ fom: formValues.fom, tom: formValues.tom });
      setVisOppfrisk(true);
    } else {
      bekreft();
    }
  };

  return (
    <div className="vurderingStart">
      <Nav.typo.Undertittel className="undertittel">Oppgi søknadsperiode og -land</Nav.typo.Undertittel>

      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Input datoFelt label="Fra og med:" feltNavn="fom" bredde="fullbredde" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Input datoFelt label="Til og med:" feltNavn="tom" bredde="fullbredde" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="5">
            <Skjema.LandVelger
              label={
                <Fragment>
                  <b>Arbeidsland</b>
                  <Hjelpetekst />
                </Fragment>
              }
              feltNavn="land"
              placeholder="Velg..."
              landkoder={alleLandkoder.map((item) => ({ ...item, term: Utils.streng.storeForbokstaver(item.term) }))}
            />
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
        <Nav.Hovedknapp mini disabled={!formIsValid} className="fane__navigasjonsknapp" onClick={fortsettHandle}>
          Fortsett
        </Nav.Hovedknapp>
      </div>

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            visMenypanel();
            bekreft();
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            tilForsiden();
          }}
          behandlingOppfriskes
          annenBehandlingOppfriskes={annenBehandlingOppfriskes}
        />
      )}
    </div>
  );
};

const VurderingStartForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.START,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingStartSchema),
})(VurderingStart);

export default connector(VurderingStartForm);
