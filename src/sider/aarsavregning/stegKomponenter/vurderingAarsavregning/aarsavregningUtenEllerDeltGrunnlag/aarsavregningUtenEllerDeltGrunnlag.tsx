import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import * as Nav from "../../../../../navFrontend";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { TidligereFakturertIAvgiftssystemetInput } from "../komponenter/tidligereFakturertIAvgiftssystemetInput";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../../ducks/aarsavregning/types";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";

import {
  medlemskapsperioderOperations,
  medlemskapsperioderSelectors,
  medlemskapsperioderTypes,
} from "../../../../../ducks/medlemskapsperioder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import {
  hentMedlemskapsFomTomDato,
  mapMedlemskapsperioder,
  mapMedlemskapsperioderFraGrunnlag,
  mapTilInntektskilderProps,
  mapTilSkatteforholdProps,
} from "../aarsavregningHelpers";
import { MedlemskapsperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

const { DELVIS_INNVILGET, INNVILGET } = MKV.Koder.innvilgelsesResultat;

const DEFAULT_MEDLEMSKAPSPERIODE = {
  id: -1,
  fomDato: "",
  tomDato: "",
  innvilgelsesResultat: "",
  trygdedekning: "",
  bestemmelse: "",
  redigerbar: true,
};

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
  harDeltGrunnlag: boolean;
}

export interface MedlemskapTomFomDatoer {
  fom?: string;
  tom?: string;
}

interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

export function AarsavregningUtenEllerDeltGrunnlag({ bekreft, oppdaterStatus, harDeltGrunnlag }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>();
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [medlemskapsperiodeFeilmelding, setMedlemskapsperiodeFeilmelding] = useState<undefined | string>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const [bestemmelser, setBestemmelser] = useState<[]>([]);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);
  const [initiellBeregningUtført, setInitiellBeregningUtført] = useState(false);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const lagredeMedlemskapsperioder = useSelector(
    medlemskapsperioderSelectors.InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector,
  );
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const dispatch = useDispatch();

  const medlemskapsTypeErPliktig = lagredeMedlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
  );
  const innvilgetMedlemskapsperiode = hentMedlemskapsFomTomDato(lagredeMedlemskapsperioder);

  const defaultPeriode = {
    fomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.fom),
    tomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.tom),
  };

  // Initiell innlasting og skjemapopulering
  useEffect(() => {
    if (behandlingID) {
      Api.Ftrl.hentBestemmelser(behandlingstema).then((res: any) => setBestemmelser(res.bestemmelser));
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((aarsavregningRes) => {
          Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID).then(
            (medlemskapsperioderRes) => {
              const innvilgedeMedlemskapsperioder = medlemskapsperioderRes?.filter(
                (periode: Medlemskapsperiode) =>
                  periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
              );
              setAarsavregningResponse(aarsavregningRes);
              setValgtÅr(aarsavregningRes.aar);
              // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
              dispatch({ type: OK, data: aarsavregningRes });

              setSkjemaverdierFraTrygdeavgiftsgrunnlag(aarsavregningRes, innvilgedeMedlemskapsperioder);
            },
          );
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setAarsavregningResponse(undefined);
          }
        });
    }
  }, []);

  // Skal kun kalles onMount
  const setSkjemaverdierFraTrygdeavgiftsgrunnlag = async (
    aarsavregningRes: AarsavregningResponse,
    innvilgedeMedlemskapsperioder: Medlemskapsperiode[],
  ) => {
    let mappedMedlemskapsperioder;
    if (
      harDeltGrunnlag &&
      innvilgedeMedlemskapsperioder.length === 0 &&
      aarsavregningRes?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag
    ) {
      // Må opprette medlemskapsperioder fra grunnlag på behandlingsresultat. Overstyrer ID til -1.
      mappedMedlemskapsperioder = mapMedlemskapsperioderFraGrunnlag(
        aarsavregningRes.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
      ).map((periode) => ({ ...periode, id: -1 }));
      await Promise.all(mappedMedlemskapsperioder.map(lagreMedlemskapsperiode));
    } else {
      mappedMedlemskapsperioder = mapMedlemskapsperioder(
        innvilgedeMedlemskapsperioder,
        aarsavregningRes.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag,
      );
    }

    const erInitiellMappingForDeltGrunnlag = harDeltGrunnlag && aarsavregningRes && !aarsavregningRes.nyttGrunnlag;

    setValue(
      "medlemskapsperioder",
      mappedMedlemskapsperioder.length ? mappedMedlemskapsperioder : [DEFAULT_MEDLEMSKAPSPERIODE],
    );
    setValue("totaltForskuddsvisFakturert", aarsavregningRes.avregning?.tidligereFakturertBeloepAvgiftssystem);
    setValue(
      "skatteforholdsperioder",
      mapTilSkatteforholdProps(
        erInitiellMappingForDeltGrunnlag
          ? aarsavregningRes.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
          : aarsavregningRes?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
        mappedMedlemskapsperioder,
      ),
    );
    setValue(
      "inntektskilder",
      mapTilInntektskilderProps(
        erInitiellMappingForDeltGrunnlag
          ? aarsavregningRes.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
          : aarsavregningRes?.nyttGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder,
        mappedMedlemskapsperioder,
      ),
    );
  };

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        Api.Aarsavregning.oppdaterTotalAvgift(
          behandlingID,
          aarsavregningID,
          aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
        ).then((response: AarsavregningResponse) => {
          setAarsavregningResponse(response);
        });
      }
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(aarsavregningUtenEllerDeltGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      aar: valgtÅr,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      medlemskapsperioder: [{}],
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
    } as FieldValue<AarsavregningFormValuesProps>,
  });

  const {
    fields: medlemskapsperioderFields,
    append: medlemskapsperioderAppend,
    remove: medlemskapsperioderRemove,
    update: medlemskapsperioderUpdate,
  } = useFieldArray<FieldArrayProps, "medlemskapsperioder", "id">({ control, name: "medlemskapsperioder" });

  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
  } = useFieldArray<FieldArrayProps, "skatteforholdsperioder", "id">({ control, name: "skatteforholdsperioder" });

  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
  } = useFieldArray<FieldArrayProps, "inntektskilder", "id">({ control, name: "inntektskilder" });

  const formValues = watch();
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const medlemskapsperioderPrevLength = useRef(medlemskapsperioder.length);
  const totaltForskuddsvisFakturert = useWatch({ control, name: "totaltForskuddsvisFakturert" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  // Initiell beregning
  useEffect(() => {
    if (formIsValid && !initiellBeregningUtført) {
      handleBeregnTrygdeavgiftsperioder(watch()).then(() => {
        setInitiellBeregningUtført(true);
      });
    }
  }, [formIsValid]);

  const lagreMedlemskapsperiode = async (medlemskapsperiode: Medlemskapsperiode) => {
    // TODO: Fjern unødvendig lagring/oppretting av medlemskapsperioder som er identiske til eksisterende perioder på behandlingsresultat)
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    };

    const response: any = await (medlemskapsperiode.id === -1
      ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
      : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
          behandlingID,
          medlemskapsperiode.id,
          periodeRequest,
        ));

    if (response.type === medlemskapsperioderTypes.FEILET) {
      setMedlemskapsperiodeFeilmelding(response?.data?.data?.message);
    }
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (medlemskapsperioderFormValues) => {
      const isValid = await trigger("medlemskapsperioder");
      if (isValid) {
        /* eslint-disable-next-line no-restricted-syntax */
        for (const periode of medlemskapsperioderFormValues) {
          await lagreMedlemskapsperiode(periode);
        }

        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
        if (initiellBeregningUtført && (await trigger())) {
          setFeilmelding(undefined);
          await handleBeregnTrygdeavgiftsperioder(watch());
        }
      }
    }, 1000),
    [],
  );

  // Håndterer endringer i medlemskapsperiodeSkjema.
  useEffect(() => {
    if (redigerbart) {
      setMedlemskapsperiodeFeilmelding(undefined);
      if (medlemskapsperioder.length !== medlemskapsperioderPrevLength.current) {
        medlemskapsperioderPrevLength.current = medlemskapsperioder.length;
        return;
      }
      debouncedLagreMedlemskapsperioder(medlemskapsperioder);
    }
  }, [medlemskapsperioder]);

  const handleLeggTilMedlemskapsperiode = () => {
    const nyMedlemskapsperiode = {
      id: -1,
      fomDato: "",
      tomDato: "",
      innvilgelsesResultat: "",
      trygdedekning: "",
      bestemmelse: "",
      redigerbar: true,
    };
    // @ts-expect-error generisk beskrivelse
    medlemskapsperioderAppend(nyMedlemskapsperiode);
  };

  const handleSlett = async (index: number) => {
    const periode = medlemskapsperioder[index];

    if (periode.id === -1) {
      medlemskapsperioderRemove(index);
    } else {
      Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, periode.id).then(() => {
        medlemskapsperioderRemove(index);
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      });
    }
    if (await trigger()) {
      setFeilmelding(undefined);
      await handleBeregnTrygdeavgiftsperioder(watch());
    }
  };

  const handleOppdaterTotaltForskuddsvisFakturert = async (
    behandlingid: number,
    request: Api.Aarsavregning.AarsavregningRequest,
    aarsavregningid?: number,
  ) => {
    await Api.Aarsavregning.oppdaterAarsavregning(behandlingid, request, aarsavregningid);
    if (await trigger()) {
      setFeilmelding(undefined);
      await handleBeregnTrygdeavgiftsperioder(watch());
    }
  };

  const debouncedOppdaterTotaltForskuddsvisFakturert = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        handleOppdaterTotaltForskuddsvisFakturert(behandlingID, request, aarsavregningID),
      1000,
    ),
    [behandlingID, aarsavregningID],
  );

  useEffect(() => {
    if (
      redigerbart &&
      (totaltForskuddsvisFakturert || totaltForskuddsvisFakturert === "") &&
      totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
    ) {
      debouncedOppdaterTotaltForskuddsvisFakturert({
        avregning: {
          tidligereFakturertBeloepAvgiftssystem: totaltForskuddsvisFakturert,
        },
      });
    }
  }, [totaltForskuddsvisFakturert]);

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      setBeregningPaagar(true);
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapsTypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeilmelding, setAarsavregningResponse, aarsavregningID],
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 1000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  // Håndterer endringer i inntektskilder og skatteforhold.
  useEffect(() => {
    if (redigerbart && aarsavregningID && initiellBeregningUtført) {
      const beregnHvisSkjemaErGyldig = async () => {
        const isValid = await trigger();
        if (isValid) {
          setBeregningPaagar(true);
          setFeilmelding(undefined);
          debounceBeregnTrygdeavgiftsperioder(formValues);
        }
      };
      beregnHvisSkjemaErGyldig();
    }
  }, [inntektskilder, skatteforholdsperioder]);

  const stegErGyldig = Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag && feilmelding === undefined);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const bekreftOnClick = () => {
    if (!harValidertSkjema) {
      trigger();
      setHarValidertSkjema(true);
    }
    if (stegErGyldig && !beregningPaagar) {
      bekreft();
    }
  };

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);

  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;

  return (
    <div className="vurderingAarsavregning">
      {harDeltGrunnlag && (
        <>
          <MedlemskapsPerioderTabell
            perioder={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <TidligereGrunnlagsoversikt
            skatteforholdsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
            }
            avgift={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift}
          />

          {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

          <BeregnetTrygdeavgiftDetaljer
            grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
            medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
            tittel="Tidligere beregnet trygdeavgift"
          />
        </>
      )}

      <TidligereFakturertIAvgiftssystemetInput
        control={control}
        redigerbart={redigerbart}
        harDeltGrunnlag={harDeltGrunnlag}
      />

      <Nav.Heading className="endelige_opplysninger_heading" level="2">
        Inntekts- og skatteopplysninger for endelig trygdeavgift
      </Nav.Heading>

      <div className="medlemskapsperioder">
        {medlemskapsperioderFields.map((field, index) => (
          <MedlemskapsperiodeSkjema
            redigerbart={redigerbart}
            control={control}
            field={field}
            index={index}
            remove={handleSlett}
            formValues={formValues}
            bestemmelser={bestemmelser}
            handleUpdate={medlemskapsperioderUpdate}
            handleLeggTil={handleLeggTilMedlemskapsperiode}
            visLeggTil
            maksVerdi={valgtÅr !== undefined ? new Date(valgtÅr, 11, 31, 23, 59, 59, 999) : undefined}
            minVerdi={valgtÅr !== undefined ? new Date(valgtÅr, 0, 1) : undefined}
          />
        ))}
      </div>

      <Skatteforholdsperioder
        defaultPeriode={defaultPeriode}
        formValues={formValues}
        redigerbart={redigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control}
        fields={skattFields}
      />
      {!trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Inntektskilder
          defaultPeriode={defaultPeriode}
          formValues={formValues}
          redigerbart={redigerbart}
          update={inntektUpdate}
          remove={inntektRemove}
          append={inntektAppend}
          control={control}
          fields={inntektFields}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          skalViseErMaanedsBelopRadioGroup
        />
      )}
      {formIsValid && trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />
      )}

      {formIsValid && !beregningPaagar && !feilmelding && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
          tidligereTrygdeavgiftAvgiftssystem={aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem}
        />
      )}

      {formIsValid && !beregningPaagar && !feilmelding && aarsavregningResponse?.nyttGrunnlag && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse.nyttGrunnlag}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          tittel="Endelig beregnet trygdeavgift"
        />
      )}

      {medlemskapsperiodeFeilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {medlemskapsperiodeFeilmelding}
        </Nav.Alert>
      )}

      {feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <Nav.Button variant="primary" loading={beregningPaagar} disabled={!redigerbart} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
