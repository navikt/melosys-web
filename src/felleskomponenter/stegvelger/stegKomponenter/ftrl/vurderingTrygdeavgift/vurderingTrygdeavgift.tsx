import React, { useEffect, useState, ChangeEvent, useCallback } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../utils/navFrontend";
import * as Api from "../../../../../services/api";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";
import * as Skjema from "../../../../skjema";

import Trygdeavgiftsgrunnlag from "./trygdeavgiftsgrunnlag/trygdeavgiftsgrunnlag";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { formSelectors } from "../../../../../ducks/form";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import { lagYupToReduxformErrorMapper } from "../../../../../yup";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import { OppdaterAvgiftsberegning } from "../../../../../services/modules/trygdeavgift";
import { BOOLSK } from "../../../../../constants";
import { VurderingTrygdeavgiftVirksomhetTyper } from "../../../../../kodeverk/koder";
import { LonnsforholdErNorgeEllerDelt, LonnsforholdErUtlandetEllerDelt } from "../selectors";

import "./vurderingTrygdeavgift.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.TRYGDEAVGIFT)(state),
  formValid: formSelectors.VurderTrygdeavgiftFormValid(state),
  saerligeavgiftsgrupper: folketrygdenkodeverkSelectors.SaerligeavgiftsgrupperSelector(state),
  erTrygdeavgiftsgrunnlagNorgeUgyldig: formSelectors.VurderTrygdeavgiftFormErTrygdeavgiftsgrunnlagNorgeUgyldig(state),
  erTrygdeavgiftsgrunnlagUtlandUgyldig: formSelectors.VurderTrygdeavgiftFormErTrygdeavgiftsgrunnlagUtlandUgyldig(state),
  lonnsforholdErNorgeEllerDelt: LonnsforholdErNorgeEllerDelt(state),
  lonnsforholdErUtlandetEllerDelt: LonnsforholdErUtlandetEllerDelt(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.TRYGDEAVGIFT, field, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  formValues: {
    avgiftsgrunnlag?: Api.Avgiftsgrunnlag;
    avgiftsberegning?: Api.Avgiftsberegning;
  };
  erStegGyldig: boolean;
}

const VurderingTrygdeavgift = ({
  bekreft,
  oppdater,
  tilbake,
  redigerbart,
  behandlingID,
  formValues,
  changeField,
  formValid,
  saerligeavgiftsgrupper,
  erTrygdeavgiftsgrunnlagNorgeUgyldig,
  erTrygdeavgiftsgrunnlagUtlandUgyldig,
  erStegGyldig,
  lonnsforholdErNorgeEllerDelt,
  lonnsforholdErUtlandetEllerDelt,
}: Props & PropsFromRedux) => {
  const [erTabellApen, setErTabellApen] = useState(new Map());
  const [erSaerligAvgiftsGruppeValgt, setErSaerligAvgiftsGruppeValgt] = useState(new Map());
  const [oppdatertAvgiftsberegning, setOppdatertAvgiftsberegning] = useState<OppdaterAvgiftsberegning>({
    avgiftspliktigLønnNorge: null,
    avgiftspliktigLønnUtland: null,
  });

  const hentBeregning = () => {
    Api.Trygdeavgift.hentBeregning(behandlingID).then((response) => {
      setOppdatertAvgiftsberegning({
        avgiftspliktigLønnNorge: response.avgiftspliktigLønnNorge,
        avgiftspliktigLønnUtland: response.avgiftspliktigLønnUtland,
      });
      changeField("avgiftsberegning", response);
    });
  };
  const debouncedHentBeregning = useCallback(Utils._debounce(hentBeregning, 1000), []);

  useEffect(() => {
    Api.Trygdeavgift.hentGrunnlag(behandlingID).then((response) => {
      if (response?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe !== undefined) {
        erSaerligAvgiftsGruppeValgt.set(
          VurderingTrygdeavgiftVirksomhetTyper.NORSK,
          !!response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe
        );
      }
      if (response?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe !== undefined) {
        erSaerligAvgiftsGruppeValgt.set(
          VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
          !!response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe
        );
      }
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
      changeField("avgiftsgrunnlag", response);
    });
    debouncedHentBeregning();
    return () => debouncedHentBeregning.cancel();
  }, []);

  useEffect(() => {
    oppdater();
  }, [formValid]);

  function erTrygdeavgiftsgrunnlagGyldig(trygdeavgiftsgrunnlag: Api.AvgiftsgrunnlagInfo | null | undefined) {
    return (
      trygdeavgiftsgrunnlag &&
      (trygdeavgiftsgrunnlag.erSkattepliktig || trygdeavgiftsgrunnlag.erSkattepliktig === false) &&
      (trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift || trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift === false) &&
      (trygdeavgiftsgrunnlag.særligAvgiftsgruppe === null ||
        (!!trygdeavgiftsgrunnlag.særligAvgiftsgruppe && trygdeavgiftsgrunnlag.særligAvgiftsgruppe !== "TRUE"))
    );
  }

  function erAvgiftsgrunnlagGyldig(avgiftsgrunnlag: Api.Avgiftsgrunnlag) {
    if (!avgiftsgrunnlag || !avgiftsgrunnlag.lønnsforhold) return false;
    switch (avgiftsgrunnlag.lønnsforhold) {
      case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
        return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge);
      case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
        return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
      case MKV.Koder.loenn_forhold.DELT_LØNN:
        return (
          !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge) &&
          !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland)
        );
      default:
        return false;
    }
  }

  function handleGrunnlagResponse(avgiftsgrunnlag: Api.Avgiftsgrunnlag) {
    if (!avgiftsgrunnlag) return;
    if (
      avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
    ) {
      setErTabellApen(new Map(erTabellApen.set(VurderingTrygdeavgiftVirksomhetTyper.NORSK, false)));
    }
    if (
      avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
    ) {
      setErTabellApen(new Map(erTabellApen.set(VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK, false)));
    }
    if (avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE) {
      erSaerligAvgiftsGruppeValgt.delete(VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    }
    if (avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET) {
      erSaerligAvgiftsGruppeValgt.delete(VurderingTrygdeavgiftVirksomhetTyper.NORSK);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    }
  }

  useEffect(() => {
    if (redigerbart && formValues?.avgiftsgrunnlag && erAvgiftsgrunnlagGyldig(formValues.avgiftsgrunnlag)) {
      Api.Trygdeavgift.sendGrunnlag(behandlingID, {
        lønnsforhold: formValues.avgiftsgrunnlag.lønnsforhold,
        trygdeavgiftsgrunnlagNorge: formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge || null,
        trygdeavgiftsgrunnlagUtland: formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland || null,
      }).then((response) => {
        changeField("avgiftsgrunnlag", response);
        handleGrunnlagResponse(response);
      });
    }
  }, [formValues?.avgiftsgrunnlag]);

  function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
    const erSærligAvgiftsgruppe = Utils.streng.tryParseBool(event.target.value);
    erSaerligAvgiftsGruppeValgt.set(
      erNorskVirksomhet ? VurderingTrygdeavgiftVirksomhetTyper.NORSK : VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
      erSærligAvgiftsgruppe
    );
    setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    const fieldBase = erNorskVirksomhet
      ? "avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge"
      : "avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland";
    changeField(`${fieldBase}.særligAvgiftsgruppe`, erSærligAvgiftsgruppe ? "TRUE" : null);
    changeField(`${fieldBase}.betalerArbeidsgiverAvgift`, erNorskVirksomhet ? BOOLSK.SANN : BOOLSK.USANN);
    changeField(`${fieldBase}.erSkattepliktig`, undefined);
    changeField("avgiftsberegning", {});
  }

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe;
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.MISJONÆR) {
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", BOOLSK.USANN);
    }
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA) {
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", BOOLSK.SANN);
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.erSkattepliktig", BOOLSK.USANN);
    }
  }, [formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe]);

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe;
    if (
      [MKV.Koder.saerligeavgiftsgrupper.FN, MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA].includes(
        særligAvgiftsgruppe
      )
    ) {
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.erSkattepliktig", BOOLSK.USANN);
    }
  }, [formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe]);

  function handleAvgiftspliktigLønnInputChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
    setOppdatertAvgiftsberegning(
      erNorskVirksomhet
        ? { ...oppdatertAvgiftsberegning, avgiftspliktigLønnNorge: parseInt(event.target.value, 10) }
        : { ...oppdatertAvgiftsberegning, avgiftspliktigLønnUtland: parseInt(event.target.value, 10) }
    );
  }

  function handleBeregnClick(erNorskVirksomhet: boolean) {
    Api.Trygdeavgift.sendBeregning(behandlingID, oppdatertAvgiftsberegning).then((response) => {
      changeField("avgiftsberegning", response);
    });
    setErTabellApen(
      new Map(
        erTabellApen.set(
          erNorskVirksomhet
            ? VurderingTrygdeavgiftVirksomhetTyper.NORSK
            : VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
          true
        )
      )
    );
  }

  const trygdeavgiftsgrunnlagComponentProps = {
    formValues,
    oppdatertAvgiftsberegning,
    erTabellApen,
    erSaerligAvgiftsGruppeValgt,
    handleBeregnClick,
    handleSærligAvgiftsgruppeRadioChange,
    handleAvgiftspliktigLønnInputChange,
    redigerbart,
    erTrygdeavgiftsgrunnlagNorgeUgyldig,
    erTrygdeavgiftsgrunnlagUtlandUgyldig,
    saerligeavgiftsgrupper,
  };

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Undertittel className="undertittel">Trygdeavgift</Nav.Typo.Undertittel>

      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
            <Skjema.Radio
              label="Norsk virksomhet"
              feltNavn="avgiftsgrunnlag.lønnsforhold"
              value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              id={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              disabled={!redigerbart}
            />
            <Skjema.Radio
              feltNavn="avgiftsgrunnlag.lønnsforhold"
              label="Utenlandsk virksomhet"
              value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              id={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              disabled={!redigerbart}
            />
            <Skjema.Radio
              label="Norsk og utenlandsk virksomhet"
              feltNavn="avgiftsgrunnlag.lønnsforhold"
              value={MKV.Koder.loenn_forhold.DELT_LØNN}
              id={MKV.Koder.loenn_forhold.DELT_LØNN}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>

      {lonnsforholdErNorgeEllerDelt && (
        <Trygdeavgiftsgrunnlag {...trygdeavgiftsgrunnlagComponentProps} erVirksomhetNorsk />
      )}
      {lonnsforholdErUtlandetEllerDelt && (
        <Trygdeavgiftsgrunnlag {...trygdeavgiftsgrunnlagComponentProps} erVirksomhetNorsk={false} />
      )}

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !erStegGyldig}
          className="fane__navigasjonsknapp"
          onClick={bekreft}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingTrygdeavgiftForm = reduxForm<{}, Props & PropsFromRedux>({
  form: KV.Form.TRYGDEAVGIFT,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingTrygdeavgiftSchema),
})(VurderingTrygdeavgift);

export default connector(VurderingTrygdeavgiftForm);
