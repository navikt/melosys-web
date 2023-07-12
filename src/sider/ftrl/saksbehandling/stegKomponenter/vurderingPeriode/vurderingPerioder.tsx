import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Ikoner from "../../../../../resources/images";
import * as KV from "../../../../../kodeverk";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import {
  medlemskapsperioderOperations,
  medlemskapsperioderSelectors,
  medlemskapsperioderTypes,
} from "../../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";

import { useAsyncCallbackState } from "../../../../../hooks";

import { PeriodeElementer } from "./komponenter/periodeElementer";
import { Feilmelding, finnAktivFeilmelding } from "./komponenter/feilmeldinger";
import {
  FieldArrayProps,
  FormValuesProps,
  MedlemskapsperiodeProp,
  Medlemskapsrespons,
  ResponsFeilet,
  VurderingPerioderProps,
} from "./komponenter/types";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import "./vurderingPerioder.css";

const mapTilMedlemskapsperiodeProps = (
  medlemskapsperiode: Api.Medlemskapsperioder.Medlemskapsperiode
): MedlemskapsperiodeProp => ({
  ...medlemskapsperiode,
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  ny: false,
  feil: undefined,
  periodeId: medlemskapsperiode.id,
});

const mapInitialMedlemskapsperioder = (
  medlemskapsperioder: Api.Medlemskapsperioder.Medlemskapsperiode[] | undefined
): MedlemskapsperiodeProp[] =>
  medlemskapsperioder
    ? [...medlemskapsperioder]
        .sort(
          (a, b) =>
            new Date(a.fomDato).getTime() - new Date(b.fomDato).getTime() ||
            (a.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT ? -1 : 1)
        )
        .map(mapTilMedlemskapsperiodeProps)
    : [];

const komponentState = (state: RootState) => ({
  valgtTrygdedekning: mottatteOpplysningerSelectors.TrygdedekningSelector(state),
  lagredeMedlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

export const VurderingPerioder = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingPerioderProps) => {
  const dispatch = useDispatch();
  const {
    redigerbart,
    valgtTrygdedekning,
    lagredeMedlemskapsperioder,
    trygdedekninger,
    behandlingID,
    innvilgelsesResultater,
    soknadsperiode,
  } = useSelector(komponentState);
  const [{ mottaksdato }] = useAsyncCallbackState(() => Api.Behandlinger.aarsak.hentMottaksdato(behandlingID), {}, [
    behandlingID,
  ]);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingPerioderSchema),
    mode: "all",
    context: { soknadsperiode },
    defaultValues: {
      medlemskapsperioder: mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder),
    } as FieldValue<FormValuesProps>,
  });
  const {
    fields,
    append,
    remove,
    update,
    replace: resetMedlemskapsperioder,
  } = useFieldArray<FieldArrayProps, "medlemskapsperioder", "id">({
    control,
    name: "medlemskapsperioder",
  });
  const formValues = watch();

  const aktivFeilmeldingType = finnAktivFeilmelding(formValues?.medlemskapsperioder, soknadsperiode.fom);

  const stegErGyldig = formIsValid && !aktivFeilmeldingType;

  useEffect(() => {
    if (aktivtSteg) {
      resetMedlemskapsperioder(mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder));
    }
  }, [aktivtSteg]);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const lagreMedlemskapsperiode = async (medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato),
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato),
      trygdedekning: medlemskapsperiode.trygdedekning,
      innvilgelsesResultat: medlemskapsperiode.innvilgelsesResultat,
    };

    // @ts-ignore
    const response: Medlemskapsrespons = await (medlemskapsperiode.ny
      ? dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiode(behandlingID, periodeRequest))
      : dispatch(
          medlemskapsperioderOperations.oppdaterMedlemskapsperiode(
            behandlingID,
            medlemskapsperiode.periodeId,
            periodeRequest
          )
        ));

    if (response?.type === medlemskapsperioderTypes.FEILET) {
      update(index, {
        ...formValues.medlemskapsperioder[index],
        feil: (response.data as ResponsFeilet)?.data?.message || response.data,
      });
    } else {
      update(index, mapTilMedlemskapsperiodeProps(response.data as Api.Medlemskapsperioder.Medlemskapsperiode));
    }
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (medlemskapsperioder, isValid, overskrevetIndex) => {
      if (isValid) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [index, medlemskapsperiode] of medlemskapsperioder.entries()) {
          // eslint-disable-next-line no-await-in-loop
          await lagreMedlemskapsperiode(medlemskapsperiode, overskrevetIndex !== undefined ? overskrevetIndex : index);
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg) {
      debouncedLagreMedlemskapsperioder(formValues.medlemskapsperioder, stegErGyldig, undefined);
    }
  }, [stegErGyldig]);

  const antallMedlemskapsperioder = formValues.medlemskapsperioder?.length;

  const ingenMedlemskapsperioder = antallMedlemskapsperioder === undefined || antallMedlemskapsperioder === 0;

  if (!aktivtSteg || !formValues) return null;

  const handleSlett = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      remove(index);
    } else {
      // @ts-ignore
      const response: Medlemskapsrespons = await dispatch(
        medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId)
      );
      if (response?.type === medlemskapsperioderTypes.FEILET) {
        update(index, {
          ...medlemskapsperiode,
          feil: (response.data as ResponsFeilet)?.data?.message || response.data,
        });
      } else {
        remove(index);
      }
    }
  };

  const handleLeggTil = () => {
    const nyMedlemskapsperiode = {
      periodeId: Utils._uuid(),
      ny: true,
      fomDato: "",
      tomDato: "",
      innvilgelsesResultat: "",
      trygdedekning: "",
    };
    append(nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const visLeggTilNyPeriode =
    redigerbart &&
    !ingenMedlemskapsperioder &&
    !formValues.medlemskapsperioder.some(
      (periode: MedlemskapsperiodeProp) =>
        Utils._isEmpty(periode.fomDato) ||
        Utils._isEmpty(periode.tomDato) ||
        Utils._isEmpty(periode.trygdedekning) ||
        Utils._isEmpty(periode.innvilgelsesResultat)
    );

  return (
    <div className="vurderingPerioder">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Kontroller medlemskapsperioder</Nav.Typo.Innholdstittel>

      <div>
        <Nav.Typo.Element className="info_element">Søknad mottatt: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst className="info_element">
          {Utils.dato.formatterDatoTilNorsk(mottaksdato)}
        </Nav.Typo.Normaltekst>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <Nav.Typo.Element className="info_element">Trygdedekning fra søknad: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst className="info_element">
          {KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, valgtTrygdedekning)}
        </Nav.Typo.Normaltekst>
      </div>

      <PeriodeElementer
        trygdedekninger={trygdedekninger}
        innvilgelsesResultater={innvilgelsesResultater}
        control={control}
        fields={fields}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
        formIsValid={stegErGyldig}
        handleChange={debouncedLagreMedlemskapsperioder}
      />

      {visLeggTilNyPeriode && (
        <div className="leggTilKnapp" title="Legg til ny periode">
          <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
            Legg til periode
          </Mui.Lenkeknapp>
        </div>
      )}

      <Feilmelding type={aktivFeilmeldingType} />

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !redigerbart || !stegErGyldig,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
