import React, { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";
import * as VurderingInngangKomponenter from "./vurderingInngangKomponenter";

import DialogboksOppfriskSak from "../../../../felleskomponenter/dialogboks/oppfrisk/dialogboksOppfrisk";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { formSelectors } from "../../../../ducks/form";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import { StegStatus } from "../../stegvelger";
import vurdering_inngang from "./vurderingInngangSchema";

import "./vurderingInngang.css";

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const initializeValues = (periode: Periode, landkoder: string[]) => ({
  fom: periode.fom ? Utils.dato.formatterDatoTilNorsk(periode.fom) : undefined,
  tom: periode.tom ? Utils.dato.formatterDatoTilNorsk(periode.tom) : undefined,
  land: landkoder[0],
});

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.Trygdeavtale.INNGANG)(state),
  initialValues: initializeValues(
    behandlingsgrunnlagSelectors.PeriodeSelector(state),
    behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state)
  ),
  formIsValid: formSelectors.TrygdeavtaleInngangFormValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: Periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadsland: (landkoder: String[]) =>
    dispatch(behandlingsgrunnlagOperations.oppdaterSoeknadsland(landkoder, false)),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  fom?: string;
  tom?: string;
  land?: string;
}

interface Props {
  annenBehandlingOppfriskes: boolean;
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  formValues: FormValuesProps;
  hentFlytOgOppdaterAktuelleSteg: () => void;
  redigerbart: boolean;
  steg: Api.Trygdeavtale.Steg;
  tilForsiden: () => void;
  oppfriskOgLastInnSaksopplysninger: () => void;
  resetFlyt: () => void;
}

const VurderingInngang = ({
  annenBehandlingOppfriskes,
  data: { landValg, andreLandValg },
  formValues,
  formIsValid,
  fortsett,
  initialValues,
  hentFlytOgOppdaterAktuelleSteg,
  lagreBehandlingsgrunnlag,
  redigerbart,
  steg,
  tilForsiden,
  oppdaterPeriode,
  oppdaterSoeknadsland,
  oppfriskOgLastInnSaksopplysninger,
  resetFlyt,
  visMenypanel,
}: PropsFromRedux & Props) => {
  const [initialFomTomLand, setInitialFomTomLand] = useState<{ fom?: string; tom?: string; land?: string }>({});
  const [ugyldigLandValgt, setUgyldigLandValgt] = useState(false);
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const skalHenteRegisteropplysninger =
    formValues?.fom !== initialFomTomLand?.fom ||
    formValues?.tom !== initialFomTomLand?.tom ||
    formValues?.land !== initialFomTomLand?.land;

  useEffect(() => {
    if (initialValues && initialValues.fom && !Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
      setInitialFomTomLand({ fom: initialValues.fom, tom: initialValues.tom, land: initialValues.land });
    }
  }, []);

  const lagreBehandlingsgrunnlagOgOppdaterFlyt = async () => {
    await lagreBehandlingsgrunnlag();
    hentFlytOgOppdaterAktuelleSteg();
  };
  const debouncedLagrebehandlingsgrunnlagOgOppdaterFlyt = useCallback(
    Utils._debounce(lagreBehandlingsgrunnlagOgOppdaterFlyt, 300),
    []
  );

  useEffect(() => {
    if (redigerbart && formValues && formIsValid) {
      const isoFom = Utils.dato.formatterDatoTilISO(formValues.fom);
      const isoTom = Utils.dato.formatterDatoTilISO(formValues.tom);
      oppdaterPeriode({
        fom: isoFom === "Invalid date" ? null : isoFom,
        tom: isoTom === "Invalid date" ? null : isoTom,
      });
      oppdaterSoeknadsland(formValues?.land ? [formValues.land] : []);

      debouncedLagrebehandlingsgrunnlagOgOppdaterFlyt();
    }
  }, [formValues?.fom, formValues?.tom, formValues?.land, formIsValid]);

  useEffect(
    () => setUgyldigLandValgt(formValues?.land ? !landValg.map(({ kode }) => kode).includes(formValues?.land) : false),
    [formValues?.land]
  );

  const innhentRegisteropplysningerHandle = () => {
    setInitialFomTomLand({ fom: formValues.fom, tom: formValues.tom, land: formValues.land });
    setVisOppfrisk(true);
  };

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel className="undertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Fra og med:" feltNavn="fom" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Til og med:" feltNavn="tom" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="5">
            <Skjema.Select
              label={<VurderingInngangKomponenter.ArbeidslandLabel />}
              feltNavn="land"
              placeholder="Velg..."
              disabled={!redigerbart}
            >
              <VurderingInngangKomponenter.LandValgSomOptions landValg={landValg} />
              {landValg && andreLandValg && <option disabled>{"\u2500"}</option>}
              <VurderingInngangKomponenter.LandValgSomOptions landValg={andreLandValg} />
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {ugyldigLandValgt && <VurderingInngangKomponenter.StegvelgerFinnesIkke />}

      {skalHenteRegisteropplysninger ? (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: innhentRegisteropplysningerHandle,
            disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart,
          }}
          bekreftTekst="Innhent registeropplysninger"
        />
      ) : (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: fortsett,
            disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart || ugyldigLandValgt,
          }}
        />
      )}

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={async () => {
            await oppfriskOgLastInnSaksopplysninger();
            resetFlyt();
          }}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            visMenypanel();
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

const VurderingInngangForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.INNGANG,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_inngang),
})(VurderingInngang);

export default connector(VurderingInngangForm);
