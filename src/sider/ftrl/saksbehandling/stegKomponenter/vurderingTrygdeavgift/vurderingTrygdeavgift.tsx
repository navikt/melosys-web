import React, { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as KV from "../../../../../kodeverk";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import { FellesHandlersContext } from "../../../../../contexts";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

import Trygdeavgiftsgrunnlag from "./trygdeavgiftsgrunnlag/trygdeavgiftsgrunnlag";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import "./vurderingTrygdeavgift.css";

const { LØNN_FRA_NORGE, LØNN_FRA_UTLANDET, DELT_LØNN } = MKV.Koder.loenn_forhold;

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const erTrygdeavgiftsgrunnlagNorgeUgyldig = (trygdeavgift: any) => {
  const { trygdeavgiftsgrunnlagNorge } = trygdeavgift.avgiftsgrunnlag;
  const { erSkattepliktig, betalerArbeidsgiverAvgift, særligAvgiftsgruppe } = trygdeavgiftsgrunnlagNorge ?? {};

  return !(
    (erSkattepliktig || erSkattepliktig === false) &&
    (betalerArbeidsgiverAvgift || betalerArbeidsgiverAvgift === false) &&
    (særligAvgiftsgruppe === null || (!!særligAvgiftsgruppe && særligAvgiftsgruppe !== "TRUE"))
  );
};

const erTrygdeavgiftsgrunnlagUtlandUgyldig = (trygdeavgift: any) => {
  if (!trygdeavgift || !trygdeavgift.avgiftsgrunnlag || !trygdeavgift.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland)
    return true;

  const { trygdeavgiftsgrunnlagUtland } = trygdeavgift.avgiftsgrunnlag;
  const { erSkattepliktig, betalerArbeidsgiverAvgift, særligAvgiftsgruppe } = trygdeavgiftsgrunnlagUtland ?? {};
  return !(
    (erSkattepliktig || erSkattepliktig === false) &&
    (betalerArbeidsgiverAvgift || betalerArbeidsgiverAvgift === false) &&
    (særligAvgiftsgruppe === null || (!!særligAvgiftsgruppe && særligAvgiftsgruppe !== "TRUE"))
  );
};

export const VurderingTrygdeavgift = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const saerligeavgiftsgrupper = useSelector(folketrygdenkodeverkSelectors.SaerligeavgiftsgrupperSelector);
  const { behandlingOppfriskes } = useContext(FellesHandlersContext) as any;

  const {
    control,
    setValue: setValueForm,
    watch,
    reset,
    formState: { isValid: formIsValid, errors },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    mode: "onChange",
    values: {
      avgiftsgrunnlag: null,
      avgiftsberegning: null,
    } as FieldValues,
  });
  const formValues = watch();

  const lonnsforholdErNorgeEllerDelt = [LØNN_FRA_NORGE, DELT_LØNN].includes(formValues.avgiftsgrunnlag?.lønnsforhold);
  const lonnsforholdErUtlandetEllerDelt = [LØNN_FRA_UTLANDET, DELT_LØNN].includes(
    formValues.avgiftsgrunnlag?.lønnsforhold
  );

  const [erTabellApen, setErTabellApen] = useState(new Map());
  const [erSaerligAvgiftsGruppeValgt, setErSaerligAvgiftsGruppeValgt] = useState(new Map());
  const [oppdatertAvgiftsberegning, setOppdatertAvgiftsberegning] = useState<Api.Trygdeavgift.OppdaterAvgiftsberegning>(
    {
      avgiftspliktigLønnNorge: null,
      avgiftspliktigLønnUtland: null,
    }
  );

  const setValue = (formNavn: string, data: any) => {
    setValueForm(formNavn, data, { shouldValidate: true });
  };

  const hentBeregning = () => {
    Api.Trygdeavgift.hentBeregning(behandlingID).then((response) => {
      setOppdatertAvgiftsberegning({
        avgiftspliktigLønnNorge: response.avgiftspliktigLønnNorge,
        avgiftspliktigLønnUtland: response.avgiftspliktigLønnUtland,
      });
      setValue("avgiftsberegning", response);
    });
  };

  const hentGrunnlag = () => {
    Api.Trygdeavgift.hentGrunnlag(behandlingID).then((response) => {
      if (response?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe !== undefined) {
        erSaerligAvgiftsGruppeValgt.set(
          KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.NORSK,
          !!response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe
        );
      }
      if (response?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe !== undefined) {
        erSaerligAvgiftsGruppeValgt.set(
          KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
          !!response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe
        );
      }
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
      setValue("avgiftsgrunnlag", response);
    });
  };

  const initierBeregningOgGrunnlag = () => {
    hentBeregning();
    hentGrunnlag();
  };

  useMemo(() => {
    reset();
    setErSaerligAvgiftsGruppeValgt(new Map());
    initierBeregningOgGrunnlag();
  }, [behandlingOppfriskes]);

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  useEffect(() => {
    initierBeregningOgGrunnlag();
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
      setErTabellApen(new Map(erTabellApen.set(KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.NORSK, false)));
    }
    if (
      avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
    ) {
      setErTabellApen(new Map(erTabellApen.set(KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK, false)));
    }
    if (avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE) {
      erSaerligAvgiftsGruppeValgt.delete(KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    }
    if (avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET) {
      erSaerligAvgiftsGruppeValgt.delete(KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.NORSK);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    }
  }

  const handleErSøkerPliktigChange = () => {
    const { avgiftsgrunnlag } = formValues;
    if (redigerbart && avgiftsgrunnlag && erAvgiftsgrunnlagGyldig(avgiftsgrunnlag)) {
      Api.Trygdeavgift.sendGrunnlag(behandlingID, {
        lønnsforhold: avgiftsgrunnlag.lønnsforhold,
        trygdeavgiftsgrunnlagNorge: avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge || null,
        trygdeavgiftsgrunnlagUtland: avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland || null,
      }).then((response) => {
        if (JSON.stringify(avgiftsgrunnlag) !== JSON.stringify(response)) {
          setValue("avgiftsgrunnlag", response);
          handleGrunnlagResponse(response);
        }
      });
    }
  };

  function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
    const erSærligAvgiftsgruppe = Utils.streng.tryParseBool(event.target.value);
    erSaerligAvgiftsGruppeValgt.set(
      erNorskVirksomhet
        ? KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.NORSK
        : KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
      erSærligAvgiftsgruppe
    );
    setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    const fieldBase = erNorskVirksomhet
      ? "avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge"
      : "avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland";

    setValue(`${fieldBase}.særligAvgiftsgruppe`, erSærligAvgiftsgruppe ? "TRUE" : null);
    setValue(`${fieldBase}.betalerArbeidsgiverAvgift`, erNorskVirksomhet);
    setValue(`${fieldBase}.erSkattepliktig`, undefined);
    setValue("avgiftsberegning", {});
  }

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe;
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.MISJONÆR) {
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", false);
    }
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA) {
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", true);
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.erSkattepliktig", false);
    }
  }, [formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe]);

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe;
    if (
      [MKV.Koder.saerligeavgiftsgrupper.FN, MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA].includes(
        særligAvgiftsgruppe
      )
    ) {
      setValue("avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.erSkattepliktig", false);
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
      setValue("avgiftsberegning", response);
    });
    setErTabellApen(
      new Map(
        erTabellApen.set(
          erNorskVirksomhet
            ? KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.NORSK
            : KV.Koder.VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
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
    handleErSøkerPliktigChange,
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Undertittel className="undertittel">Trygdeavgift</Nav.Typo.Undertittel>

      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
            <Forms.Radio
              label="Norsk virksomhet"
              name="avgiftsgrunnlag.lønnsforhold"
              control={control}
              value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              disabled={!redigerbart}
            />
            <Forms.Radio
              name="avgiftsgrunnlag.lønnsforhold"
              control={control}
              label="Utenlandsk virksomhet"
              value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              disabled={!redigerbart}
            />
            <Forms.Radio
              label="Norsk og utenlandsk virksomhet"
              name="avgiftsgrunnlag.lønnsforhold"
              control={control}
              value={MKV.Koder.loenn_forhold.DELT_LØNN}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>

      {lonnsforholdErNorgeEllerDelt && (
        <Trygdeavgiftsgrunnlag
          {...trygdeavgiftsgrunnlagComponentProps}
          setValue={(field: string, value: string) => setValue(field, value)}
          erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig(formValues)}
          erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig(formValues)}
          erVirksomhetNorsk
        />
      )}
      {lonnsforholdErUtlandetEllerDelt && (
        <Trygdeavgiftsgrunnlag
          {...trygdeavgiftsgrunnlagComponentProps}
          setValue={(field: string, value: string) => setValue(field, value)}
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
