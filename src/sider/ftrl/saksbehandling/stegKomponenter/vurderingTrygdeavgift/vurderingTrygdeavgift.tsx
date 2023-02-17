import React, { useEffect, useState, ChangeEvent, useCallback } from "react";
import { RootState } from "AppTypes";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, FieldValues } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import * as Utils from "../../../../../utils";
import * as Skjema from "../../../../../felleskomponenter/skjema";

import Trygdeavgiftsgrunnlag from "./trygdeavgiftsgrunnlag/trygdeavgiftsgrunnlag";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import { OppdaterAvgiftsberegning } from "../../../../../services/modules/trygdeavgift";
import { VurderingTrygdeavgiftVirksomhetTyper } from "../../../../../kodeverk/koder";

import "./vurderingTrygdeavgift.css";
import { RedigerbartSelector } from "../../../../../ducks/redigerbart/selectors";

const komponentState = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  saerligeavgiftsgrupper: folketrygdenkodeverkSelectors.SaerligeavgiftsgrupperSelector(state),
});
const { LØNN_FRA_NORGE, LØNN_FRA_UTLANDET, DELT_LØNN } = MKV.Koder.loenn_forhold;

interface Props {
  bekreft: () => void;
  tilbake: () => void;
}

const erTrygdeavgiftsgrunnlagNorgeUgyldig = (trygdeavgift: any) =>
  !(
    (trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.erSkattepliktig ||
      trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.erSkattepliktig === false) &&
    (trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.betalerArbeidsgiverAvgift ||
      trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.betalerArbeidsgiverAvgift === false) &&
    (trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe === null ||
      (!!trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe &&
        trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe !== "TRUE"))
  );

const erTrygdeavgiftsgrunnlagUtlandUgyldig = (trygdeavgift: any) => {
  if (!trygdeavgift || !trygdeavgift.avgiftsgrunnlag || !trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland)
    return true;
  return !(
    (trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.erSkattepliktig ||
      trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.erSkattepliktig === false) &&
    (trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.betalerArbeidsgiverAvgift ||
      trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.betalerArbeidsgiverAvgift === false) &&
    (trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe === null ||
      (!!trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe &&
        trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe !== "TRUE"))
  );
};

export const VurderingTrygdeavgift = ({ bekreft, tilbake }: Props) => {
  const { behandlingID, saerligeavgiftsgrupper } = useSelector((state: RootState) => komponentState(state));

  const {
    control,
    setValue,
    watch,
    formState: { isValid: formIsValid, errors },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    mode: "onChange",
    defaultValues: {
      avgiftsgrunnlag: null,
      avgiftsberegning: null,
    } as FieldValues,
  });
  const formValues = watch();
  const lonnsforholdErNorgeEllerDelt = [LØNN_FRA_NORGE, DELT_LØNN].includes(formValues.avgiftsgrunnlag?.lønnsforhold);
  const lonnsforholdErUtlandetEllerDelt = [LØNN_FRA_UTLANDET, DELT_LØNN].includes(
    formValues.avgiftsgrunnlag?.lønnsforhold
  );

  const redigerbart = useSelector((state: RootState) => RedigerbartSelector(state));

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
      setValue("avgiftsberegning", response, { shouldValidate: true });
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
      setValue("avgiftsgrunnlag", response, { shouldValidate: true });
    });
    debouncedHentBeregning();
    return () => debouncedHentBeregning.cancel();
  }, []);

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
        if (JSON.stringify(formValues.avgiftsgrunnlag) !== JSON.stringify(response)) {
          setValue("avgiftsgrunnlag", response, { shouldValidate: true });
          handleGrunnlagResponse(response);
        }
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

    setValue(`${fieldBase}.særligAvgiftsgruppe`, erSærligAvgiftsgruppe ? "TRUE" : null, { shouldValidate: true });
    setValue(`${fieldBase}.betalerArbeidsgiverAvgift`, erNorskVirksomhet, { shouldValidate: true });
    setValue(`${fieldBase}.erSkattepliktig`, undefined, { shouldValidate: true });
  }

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe;
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.MISJONÆR) {
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", false, { shouldValidate: true });
    }
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA) {
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", true, { shouldValidate: true });
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.erSkattepliktig", false, { shouldValidate: true });
    }
  }, [formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe]);

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe;
    if (
      [MKV.Koder.saerligeavgiftsgrupper.FN, MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA].includes(
        særligAvgiftsgruppe
      )
    ) {
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.erSkattepliktig", false, { shouldValidate: true });
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
      setValue("avgiftsberegning", response, { shouldValidate: true });
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
    control,
    errors,
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
            <Skjema.RadioV2
              label="Norsk virksomhet"
              name="avgiftsgrunnlag.lønnsforhold"
              control={control}
              feil={(errors.avgiftsgrunnlag as any)?.lønnsforhold.message?.melding}
              value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              checked={formValues.avgiftsgrunnlag?.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              disabled={!redigerbart}
            />
            <Skjema.RadioV2
              name="avgiftsgrunnlag.lønnsforhold"
              control={control}
              label="Utenlandsk virksomhet"
              feil={(errors.avgiftsgrunnlag as any)?.lønnsforhold.message?.melding}
              value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              checked={formValues.avgiftsgrunnlag?.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              disabled={!redigerbart}
            />
            <Skjema.RadioV2
              label="Norsk og utenlandsk virksomhet"
              name="avgiftsgrunnlag.lønnsforhold"
              feil={(errors.avgiftsgrunnlag as any)?.lønnsforhold.message?.melding}
              control={control}
              value={MKV.Koder.loenn_forhold.DELT_LØNN}
              checked={formValues.avgiftsgrunnlag?.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>

      {lonnsforholdErNorgeEllerDelt && (
        <Trygdeavgiftsgrunnlag
          {...trygdeavgiftsgrunnlagComponentProps}
          setValue={(field: string, value: string) => setValue(field, value, { shouldValidate: true })}
          erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig(formValues)}
          erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig(formValues)}
          erVirksomhetNorsk
        />
      )}
      {lonnsforholdErUtlandetEllerDelt && (
        <Trygdeavgiftsgrunnlag
          {...trygdeavgiftsgrunnlagComponentProps}
          setValue={(field: string, value: string) => setValue(field, value, { shouldValidate: true })}
          erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig(formValues)}
          erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig(formValues)}
          erVirksomhetNorsk={false}
        />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: bekreft, disabled: !redigerbart || !formIsValid }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
