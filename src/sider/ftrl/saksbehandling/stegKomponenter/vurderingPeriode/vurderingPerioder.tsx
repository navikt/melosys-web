import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
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

import { Medlemskapsperioder } from "./komponenter/medlemskapsperioder";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "./komponenter/feilmeldinger";
import { FieldArrayProps, FormValuesProps, MedlemskapsperiodeProp, VurderingPerioderProps } from "./komponenter/types";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import "./vurderingPerioder.css";

const kallFeilet = (response: any): boolean => response.type === medlemskapsperioderTypes.FEILET;

const mapFeil = (response: any) => response?.data?.message || response.data;

const mapTilMedlemskapsperiodeProps = (
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode
): MedlemskapsperiodeProp => ({
  ...medlemskapsperiode,
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  ny: false,
  feil: undefined,
  periodeId: medlemskapsperiode.id,
});

const mapInitialMedlemskapsperioder = (
  medlemskapsperioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[] | undefined
): MedlemskapsperiodeProp[] =>
  medlemskapsperioder
    ? [...medlemskapsperioder]
        .sort(
          (a, b) =>
            Utils.dato.sorterEtterISOFomDato(a, b) ||
            (a.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT ? -1 : 1)
        )
        .map(mapTilMedlemskapsperiodeProps)
    : [];

const komponentState = (state: RootState) => ({
  lagredeMedlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

export const VurderingPerioder = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingPerioderProps) => {
  const dispatch = useDispatch();
  const {
    redigerbart,
    lagredeMedlemskapsperioder,
    trygdedekninger,
    behandlingID,
    innvilgelsesResultater,
    soknadsperiode,
    behandlingstype,
  } = useSelector(komponentState);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
    trigger,
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

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.medlemskapsperioder,
    soknadsperiode.fom,
    soknadsperiode.tom
  );

  const stegErGyldig = formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType);

  useEffect(() => {
    if (aktivtSteg) {
      resetMedlemskapsperioder(mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder));
      if (!formIsValid) {
        lagredeMedlemskapsperioder?.forEach((_periode, index) => {
          trigger(`medlemskapsperioder[${index}].fomDato`);
          trigger(`medlemskapsperioder[${index}].tomDato`);
        });
      }
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

    const response: any = await (medlemskapsperiode.ny
      ? dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiode(behandlingID, periodeRequest))
      : dispatch(
          medlemskapsperioderOperations.oppdaterMedlemskapsperiode(
            behandlingID,
            medlemskapsperiode.periodeId,
            periodeRequest
          )
        ));

    if (kallFeilet(response)) {
      update(index, { ...formValues.medlemskapsperioder[index], feil: mapFeil(response) });
    } else {
      update(index, mapTilMedlemskapsperiodeProps(response.data));
    }
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (medlemskapsperioder, isValid, overskrevetIndex) => {
      if (isValid) {
        // eslint-disable-next-line no-restricted-syntax
        for (const periode of medlemskapsperioder) {
          const index = overskrevetIndex !== undefined ? overskrevetIndex : medlemskapsperioder.indexOf(periode);
          await lagreMedlemskapsperiode(periode, index);
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

  if (!aktivtSteg || !formValues) return null;

  const handleSlett = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      remove(index);
    } else {
      const response = await dispatch(
        medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId)
      );
      if (kallFeilet(response)) {
        update(index, { ...medlemskapsperiode, feil: mapFeil(response) });
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
    // @ts-ignore
    append(nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const feltErFyltInn = !formValues.medlemskapsperioder.some(
    (periode: MedlemskapsperiodeProp) =>
      Utils._isEmpty(periode.fomDato) ||
      Utils._isEmpty(periode.trygdedekning) ||
      Utils._isEmpty(periode.innvilgelsesResultat)
  );

  const visLeggTilNyPeriode = redigerbart && feltErFyltInn;

  return (
    <div className="vurderingPerioder">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Medlemskapsperioder</Nav.Typo.Innholdstittel>

      <Medlemskapsperioder
        trygdedekninger={trygdedekninger}
        innvilgelsesResultater={innvilgelsesResultater}
        control={control}
        fields={fields}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
        formIsValid={stegErGyldig}
        handleChange={debouncedLagreMedlemskapsperioder}
        handleLeggTil={handleLeggTil}
        visLeggTil={visLeggTilNyPeriode}
        behandlingstype={behandlingstype}
      />

      {feltErFyltInn && <Feilmelding type={aktivFeilmeldingType} />}

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
