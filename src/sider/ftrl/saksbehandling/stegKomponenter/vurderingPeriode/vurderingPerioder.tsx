import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../../hooks";

import * as Mui from "../../../../../felleskomponenter/ui";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import { MedlemskapsperiodeDto } from "../../../../../services/modules/types/periodeTyper";
import * as Utils from "../../../../../utils";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import {
  medlemskapsperioderOperations,
  medlemskapsperioderSelectors,
  medlemskapsperioderTypes,
} from "../../../../../ducks/medlemskapsperioder";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_FTRL_BEGRENSE_PERIODE_VEDTAK } from "../../../../../featuretoggle/toggleNavn";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "./komponenter/feilmeldinger";
import { Medlemskapsperioder } from "./komponenter/medlemskapsperioder";
import { FormValuesProps, MedlemskapsperiodeProp, VurderingPerioderProps } from "./komponenter/types";
import { UkjentSluttdatoMedlemskapsperiode } from "./komponenter/ukjentSluttdatoMedlemskapsperiode";
import "./vurderingPerioder.less";
import vurderingPerioderSchema from "./vurderingPerioderSchema";

const { AVSLAATT, OPPHØRT } = MKV.Koder.innvilgelsesResultat;
const { NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;
const { FTRL_KAP2_2_15_ANDRE_LEDD, FTRL_KAP2_2_1 } = MKV.Koder.folketrygdloven_kap2_bestemmelser;
const { PLIKTIG } = MKV.Koder.medlemskapstyper;
const { YRKESAKTIV, PENSJONIST } = MKV.Koder.behandlinger.behandlingstema;

const hentInformasjonstekst = (behandlingstype: string, medlemskapsTypeErPliktig: boolean) => {
  if (medlemskapsTypeErPliktig) {
    return "Ved pliktig medlemskap foreslår Melosys alltid å innvilge hele søknadsperioden med full dekning. Juster hvis nødvendig.";
  }
  if (behandlingstype === NY_VURDERING) {
    return "Ved ny vurdering av frivillig medlemskap vises tidligere innvilgede perioder med dekning. Gjør nødvendige endringer eller legg til periode.";
  }
  if (behandlingstype === MANGLENDE_INNBETALING_TRYGDEAVGIFT) {
    return "Ved manglende innbetaling vises tidligere innvilgede medlemskapsperioder med dekning. Gjør nødvendige endringer og opphør eller forkort medlemskapsperiode(r).";
  }
  return "Ved frivillig medlemskap foreslår Melosys medlemskapsperioder ut i fra søkt dekning og mottaksdato. Juster hvis nødvendig.";
};

const kallFeilet = (response: any): boolean => response.type === medlemskapsperioderTypes.FEILET;

const mapFeil = (response: any) => response?.data?.message || response.data;

const mapTilMedlemskapsperiodeProps = (medlemskapsperiode: MedlemskapsperiodeDto): MedlemskapsperiodeProp => ({
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  innvilgelsesResultat: medlemskapsperiode.innvilgelsesResultat,
  bestemmelse: medlemskapsperiode.bestemmelse,
  trygdedekning: medlemskapsperiode.trygdedekning,
  ny: false,
  feil: undefined,
  periodeId: medlemskapsperiode.id,
});

const mapInitialMedlemskapsperioder = (medlemskapsperioder: MedlemskapsperiodeDto[]): MedlemskapsperiodeProp[] =>
  [...medlemskapsperioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b) || (a.innvilgelsesResultat === AVSLAATT ? -1 : 1))
    .map(mapTilMedlemskapsperiodeProps);

export function VurderingPerioder({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingPerioderProps) {
  const dispatch = useDispatch();
  const [lovligeDekninger, setLovligeDekninger] = useState<string[]>([]);
  const [lovligeInnvilgelsesresultat, setLovligeInnvilgelsesresultat] = useState<string[]>([]);

  const begrensePeriodeVedtakToggleEnabled = useFeatureToggle(MELOSYS_FTRL_BEGRENSE_PERIODE_VEDTAK);

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const lagredeMedlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const lagretBestemmelse = useSelector(medlemskapsperioderSelectors.BestemmelseSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const ikkeyrkesaktivOppholdstype = useSelector(oppsummertfaktaSelectors.IkkeYrkesaktivOppholdSelector);
  const medlemskapsTypeErPliktig = lagredeMedlemskapsperioder.some((periode) => periode.medlemskapstype === PLIKTIG);
  const arbeidssituasjonType = useSelector(oppsummertfaktaSelectors.ArbeidssituasjonSelector);
  const ukjentSluttdatoMedlemskapsperiode = useSelector(
    oppsummertfaktaSelectors.UkjentSluttdatoMedlemskapsperiodeSelector,
  );

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
    trigger,
  } = useForm({
    resolver: yupResolver(vurderingPerioderSchema),
    mode: "onChange",
    context: { soknadsperiode, soknadsland },
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
  } = useFieldArray({
    control: control as any,
    name: "medlemskapsperioder",
  }) as any;
  const formValues = watch();

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.medlemskapsperioder,
    behandlingstype,
    behandlingstema,
    begrensePeriodeVedtakToggleEnabled,
    soknadsperiode.fom,
    soknadsperiode.tom,
    ikkeyrkesaktivOppholdstype,
    arbeidssituasjonType,
  );

  const stegErGyldig = formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType);

  useEffect(() => {
    if (aktivtSteg) {
      let initialPerioder = mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder);
      // Hvis ukjentSluttdatoMedlemskapsperiode er true, sett sluttdatoer til 10 år etter startdato
      if (ukjentSluttdatoMedlemskapsperiode) {
        initialPerioder = mapUkjentSluttdatoMedlemskapsperiode(initialPerioder);
      }
      resetMedlemskapsperioder(initialPerioder);

      if (!formIsValid) {
        lagredeMedlemskapsperioder.forEach((_periode, index) => {
          trigger(`medlemskapsperioder[${index}].fomDato`);
          trigger(`medlemskapsperioder[${index}].tomDato`);
        });
      }
    }
  }, [aktivtSteg]);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  useEffect(() => {
    if (lagretBestemmelse) {
      Api.LovligeKombinasjoner.hentTrygdedekninger(lagretBestemmelse).then(setLovligeDekninger);
    } else {
      setLovligeDekninger([]);
    }
    Api.Ftrl.hentGyldigeInnvilgelsesresultat(behandlingstype).then(setLovligeInnvilgelsesresultat);
  }, [lagretBestemmelse]);

  const mapUkjentSluttdatoMedlemskapsperiode = (perioder: any) => {
    return perioder.map((periode: any, index: number) => {
      if (periode.fomDato) {
        const fomISODate = Utils.dato.formatterDatoTilISO(periode.fomDato, "");
        const erSistePeriodeILista = index === perioder.length - 1;
        if (fomISODate && (erSistePeriodeILista || !periode.tomDato)) {
          const fomDate = new Date(fomISODate);
          const tomDate = new Date(fomDate);
          tomDate.setFullYear(tomDate.getFullYear() + 10);
          return {
            ...periode,
            tomDato: Utils.dato.formatterDatoTilNorsk(tomDate.toISOString()),
          };
        }
      }
      return periode;
    });
  };

  const lagreUkjentSluttdatoMedlemskapsperiode = async (ukjentSluttdato: boolean) => {
    if (ukjentSluttdato) {
      const lagretPerioder = mapUkjentSluttdatoMedlemskapsperiode(formValues.medlemskapsperioder);
      resetMedlemskapsperioder(lagretPerioder);

      await trigger("medlemskapsperioder");
      await debouncedLagreMedlemskapsperioder(lagretPerioder, true, undefined);
    }

    dispatch(oppsummertfaktaOperations.lagreUkjentSluttdatoMedlemskapsperiode(behandlingID, ukjentSluttdato));
  };

  const lagreMedlemskapsperiode = async (medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse:
        medlemskapsperiode.innvilgelsesResultat === OPPHØRT
          ? FTRL_KAP2_2_15_ANDRE_LEDD
          : medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: medlemskapsperiode.innvilgelsesResultat,
    };

    const response: any = await (medlemskapsperiode.ny
      ? dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiode(behandlingID, periodeRequest))
      : dispatch(
          medlemskapsperioderOperations.oppdaterMedlemskapsperiode(
            behandlingID,
            medlemskapsperiode.periodeId,
            periodeRequest,
          ),
        ));

    if (kallFeilet(response)) {
      update(index, { ...formValues.medlemskapsperioder[index], feil: mapFeil(response) });
    } else {
      update(index, mapTilMedlemskapsperiodeProps(response.data));
    }
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(
      async (medlemskapsperioder: MedlemskapsperiodeProp[], isValid: boolean, overskrevetIndex: number | undefined) => {
        if (isValid) {
          for (const periode of medlemskapsperioder) {
            const index = overskrevetIndex !== undefined ? overskrevetIndex : medlemskapsperioder.indexOf(periode);
            await lagreMedlemskapsperiode(periode, index);
          }
        }
      },
      500,
    ),
    [],
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg) {
      debouncedLagreMedlemskapsperioder(formValues.medlemskapsperioder, stegErGyldig, undefined);
    }
    return () => debouncedLagreMedlemskapsperioder.cancel();
  }, [stegErGyldig]);

  if (!aktivtSteg || !formValues) return null;

  const handleSlett = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      remove(index);
    } else {
      const response = await dispatch(
        medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId),
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
      bestemmelse: lagretBestemmelse,
    };
    append(nyMedlemskapsperiode as any);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const feltErFyltInn = !formValues.medlemskapsperioder.some(
    (periode: MedlemskapsperiodeProp) =>
      Utils._isEmpty(periode.fomDato) ||
      Utils._isEmpty(periode.trygdedekning) ||
      Utils._isEmpty(periode.innvilgelsesResultat),
  );
  const erPensjonist = behandlingstema === PENSJONIST;
  const ukjentSluttdatoMedlemskapsperiodeSkalVises =
    (behandlingstema === YRKESAKTIV || erPensjonist) && lagretBestemmelse !== FTRL_KAP2_2_1;

  const visLeggTilNyPeriode = redigerbart && feltErFyltInn;
  const visFeilmeldinger = feilMeldingBlokkerer(aktivFeilmeldingType) ? feltErFyltInn : feltErFyltInn && formIsValid;

  return (
    <div className="vurderingPerioder">
      <Nav.Heading level="1" className="stegvelgertittel">
        Medlemskapsperioder
      </Nav.Heading>

      <Nav.BodyLong size="small" className="informasjonstekst">
        {hentInformasjonstekst(behandlingstype, medlemskapsTypeErPliktig)}
      </Nav.BodyLong>

      {ukjentSluttdatoMedlemskapsperiodeSkalVises && (
        <UkjentSluttdatoMedlemskapsperiode
          ukjentSluttdatoMedlemskapsperiode={ukjentSluttdatoMedlemskapsperiode || false}
          onUkjentSluttdatoChange={lagreUkjentSluttdatoMedlemskapsperiode}
          erPensjonist={erPensjonist}
          redigerbart={redigerbart}
        />
      )}

      <Medlemskapsperioder
        trygdedekninger={lovligeDekninger}
        innvilgelsesResultater={lovligeInnvilgelsesresultat}
        control={control}
        fields={fields}
        watch={watch}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
        formIsValid={stegErGyldig}
        handleChange={debouncedLagreMedlemskapsperioder}
        handleLeggTil={handleLeggTil}
        visLeggTil={visLeggTilNyPeriode}
        ukjentSluttdato={ukjentSluttdatoMedlemskapsperiode}
      />

      {visFeilmeldinger && <Feilmelding type={aktivFeilmeldingType} />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !redigerbart || !stegErGyldig,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}
