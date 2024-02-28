import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";

import { Medlemskapsperioder } from "./komponenter/medlemskapsperioder";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "./komponenter/feilmeldinger";
import { FieldArrayProps, FormValuesProps, MedlemskapsperiodeProp, VurderingPerioderProps } from "./komponenter/types";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import "./vurderingPerioder.css";
import { useFeatureToggle } from "../../../../../featuretoggle";
import {
  MELOSYS_FTRL_BEGRENSE_PERIODE_VEDTAK,
  MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING,
} from "../../../../../featuretoggle/toggleNavn";
import { oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";

const { AVSLAATT, OPPHØRT } = MKV.Koder.innvilgelsesResultat;
const { NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;
const { FTRL_KAP2_2_15_ANDRE_LEDD } = MKV.Koder.folketrygdloven_kap2_bestemmelser;

const hentLabelTekst = (behandlingstype: string) => {
  if (behandlingstype === NY_VURDERING) {
    return "Ved ny vurdering vises tidligere innvilgede medlemskapsperioder med dekning. Gjør nødvendige endringer eller legg til en ny periode.";
  }
  if (behandlingstype === MANGLENDE_INNBETALING_TRYGDEAVGIFT) {
    return "Ved manglende innbetaling vises tidligere innvilgede medlemskapsperioder med dekning. Gjør nødvendige endringer og opphør eller forkort medlemskapsperiode(r).";
  }
  return "Vurder og eventuelt juster de foreslåtte medlemskapsperioden(e).";
};

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
  medlemskapsperioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[]
): MedlemskapsperiodeProp[] =>
  [...medlemskapsperioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b) || (a.innvilgelsesResultat === AVSLAATT ? -1 : 1))
    .map(mapTilMedlemskapsperiodeProps);

export const VurderingPerioder = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingPerioderProps) => {
  const dispatch = useDispatch();
  const [lovligeDekninger, setLovligeDekninger] = useState<string[]>([]);
  const [lovligeInnvilgelsesresultat, setLovligeInnvilgelsesresultat] = useState<string[]>([]);

  const begrensePeriodeVedtakToggleEnabled = useFeatureToggle(MELOSYS_FTRL_BEGRENSE_PERIODE_VEDTAK);
  const manglendeInnbetalingToggleEnabled = useFeatureToggle(MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING);

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const lagredeMedlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const lagretBestemmelse = useSelector(medlemskapsperioderSelectors.BestemmelseSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const ikkeyrkesaktivOppholdstype = useSelector(oppsummertfaktaSelectors.IkkeYrkesaktivOppholdSelector);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
    trigger,
  } = useForm({
    resolver: yupResolver(vurderingPerioderSchema),
    mode: "all",
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
  } = useFieldArray<FieldArrayProps, "medlemskapsperioder", "id">({
    control,
    name: "medlemskapsperioder",
  });
  const formValues = watch();

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.medlemskapsperioder,
    behandlingstype,
    soknadsland,
    begrensePeriodeVedtakToggleEnabled,
    manglendeInnbetalingToggleEnabled,
    soknadsperiode.fom,
    soknadsperiode.tom,
    ikkeyrkesaktivOppholdstype
  );

  const stegErGyldig = formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType);

  useEffect(() => {
    if (aktivtSteg) {
      resetMedlemskapsperioder(mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder));
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
    Api.LovligeKombinasjoner.hentTrygdedekninger(lagretBestemmelse).then(setLovligeDekninger);
    Api.Ftrl.hentGyldigeInnvilgelsesresultat(behandlingstype).then(setLovligeInnvilgelsesresultat);
  }, [lagretBestemmelse]);

  const lagreMedlemskapsperiode = async (medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato),
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato),
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
      bestemmelse: lagretBestemmelse,
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

      <Nav.Typo.Normaltekst className="labelTekst">{hentLabelTekst(behandlingstype)}</Nav.Typo.Normaltekst>

      <Medlemskapsperioder
        trygdedekninger={lovligeDekninger}
        innvilgelsesResultater={lovligeInnvilgelsesresultat}
        control={control}
        fields={fields}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
        formIsValid={stegErGyldig}
        handleChange={debouncedLagreMedlemskapsperioder}
        handleLeggTil={handleLeggTil}
        visLeggTil={visLeggTilNyPeriode}
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
