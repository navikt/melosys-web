import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useState } from "react";
import { AarsavregningResponse, oppdaterTotalBelop } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import * as Nav from "../../../../../navFrontend";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { TidligereGrunnlagsopplysningerFinnesIkke } from "../komponenter/tidligereGrunnlagsopplysningerFinnesIkke";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../../ducks/aarsavregning/types";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";

import medlemskapsperioder, {
  medlemskapsperioderOperations,
  medlemskapsperioderSelectors,
  medlemskapsperioderTypes,
} from "../../../../../ducks/medlemskapsperioder";
import { MedlemskapsperiodeProp } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/types";
import { Medlemskapsperioder } from "../komponenter/medlemskapsperioder";
import { FeilmeldingOppsummering } from "../feilmeldingOppsummering";
import aarsavregningUtenGrunnlagSchema from "./aarsavregningUtenGrunnlagSchema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { beregnTrygdeavgiftsperioder } from "../komponenter/utils";
import {
  hentMedlemskapsFomTomDato,
  mapInitialMedlemskapsperioder,
  mapTilInntektskilderProps,
  mapTilMedlemskapsperiodeProps,
  mapTilSkatteforholdProps,
} from "../aarsavregningHelpers";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export interface MedlemskapTomFomDatoer {
  fom?: string;
  tom?: string;
}

interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

export function AarsavregningUtenGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>();
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [brukerHarBekreftet, setBrukerHarBekreftet] = useState(false);

  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const [bestemmelser, setBestemmelser] = useState<[]>([]);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const lagredeMedlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (behandlingstema) {
      Api.Ftrl.hentBestemmelser(behandlingstema).then((res: any) => setBestemmelser(res.bestemmelser));
    }
  }, [behandlingstema]);

  useEffect(() => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    if (behandlingID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((res) => {
          setAarsavregningResponse(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          setValgtÅr(res.aar);
          setValue("totaltForskuddsvisFakturert", res.avregning?.tidligereFakturertBeloep);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setAarsavregningResponse(undefined);
          }
        });
    }
  }, []);

  function checkPeriods(periods: Medlemskapsperiode[]) {
    if (periods.length === 0) {
      return { overlap: false, gap: false, sameBestemmelse: false };
    }
    console.log(periods.length);

    // Sort periods by start date
    const sortedPeriods = [...periods].sort((a, b) => new Date(a.fomDato).getTime() - new Date(b.fomDato).getTime());

    let overlap = false;
    let gap = false;
    const bestemmelseSet = new Set<string>();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < sortedPeriods.length; i++) {
      console.log(sortedPeriods[i].bestemmelse);
      bestemmelseSet.add(sortedPeriods[i].bestemmelse);
      if (i > 0) {
        const prevPeriod = sortedPeriods[i - 1];
        const currPeriod = sortedPeriods[i];

        const prevEndDate = new Date(prevPeriod.tomDato);
        const currStartDate = new Date(currPeriod.fomDato);

        if (currStartDate <= prevEndDate) {
          overlap = true;
        }
        if (currStartDate.getTime() - prevEndDate.getTime() > 86400000) {
          // 1 day gap
          gap = true;
        }
      }
    }

    console.log(bestemmelseSet.size);
    const sameBestemmelse = bestemmelseSet.size !== 1;
    console.log(sameBestemmelse);

    return { overlap, gap, sameBestemmelse };
  }

  useEffect(() => {
    const test = checkPeriods(lagredeMedlemskapsperioder);

    let nyFeilmelding: string | undefined;

    switch (true) {
      case test.gap:
        nyFeilmelding = "Det er opphold mellom medlemskapsperioder";
        break;
      case test.overlap:
        nyFeilmelding = "Medlemskapsperioder overlapper";
        break;
      case test.sameBestemmelse:
        console.log("WHAT");
        nyFeilmelding = "Bestemmelsene må være like";
        break;
      default:
        nyFeilmelding = undefined;
    }

    console.log(lagredeMedlemskapsperioder);

    console.log(nyFeilmelding);
    setFeilmelding(nyFeilmelding);

    if (lagredeMedlemskapsperioder) {
      const mappedLagredeMedlemskapsperioder = mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder);
      setValue("medlemskapsperioder", mappedLagredeMedlemskapsperioder);
      setValue(
        "skatteforholdsperioder",
        mapTilSkatteforholdProps(
          aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
          mappedLagredeMedlemskapsperioder,
        ),
      );
      setValue(
        "inntektskilder",
        mapTilInntektskilderProps(
          aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder,
          mappedLagredeMedlemskapsperioder,
        ),
      );
    }
  }, [lagredeMedlemskapsperioder, aarsavregningResponse]);

  const oppdaterNyttTotalbeloep = async (totalAvgift?: number) => {
    return oppdaterTotalBelop(
      behandlingID,
      {
        avregning: {
          nyttTotalbeloep: totalAvgift,
        },
      },
      aarsavregningID,
    );
  };

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        oppdaterNyttTotalbeloep(aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift).then(
          (response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
          },
        );
      }
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const medlemskapsTypeErPliktig = lagredeMedlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
  );

  const innvilgetMedlemskapsperiode = hentMedlemskapsFomTomDato(lagredeMedlemskapsperioder);

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors: formErrors, isValid: formIsValid, isValidating },
  } = useForm({
    resolver: yupResolver(aarsavregningUtenGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig,
    },
    mode: "onChange",
    defaultValues: {
      medlemskapsperioder: mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder),
      skatteforholdsperioder: mapTilSkatteforholdProps(
        aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
      ),
      inntektskilder: [{}],
      totaltForskuddsvisFakturert: "",
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
    replace: resetSkatteforholdsperioder,
  } = useFieldArray<FieldArrayProps, "skatteforholdsperioder", "id">({ control, name: "skatteforholdsperioder" });

  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
    replace: resetInntektskilder,
  } = useFieldArray<FieldArrayProps, "inntektskilder", "id">({ control, name: "inntektskilder" });

  const formValues = watch();

  useEffect(() => {
    if (brukerHarBekreftet && Object.keys(formErrors).length === 0) {
      setBrukerHarBekreftet(false);
    }
  }, [formValues]);

  useEffect(() => {
    if (medlemskapsperioderFields.length === 0) {
      handleLeggTilMedlemskapsperiode();
    }
  }, [medlemskapsperioderFields]);

  useEffect(() => {
    if (
      redigerbart &&
      (formValues.totaltForskuddsvisFakturert || formValues.totaltForskuddsvisFakturert === "") &&
      formValues.totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloep
    ) {
      oppdaterTotalBelop(
        behandlingID,
        {
          avregning: {
            tidligereFakturertBeloep: formValues.totaltForskuddsvisFakturert,
          },
        },
        aarsavregningID,
      );
    }
  }, [formValues.totaltForskuddsvisFakturert]);

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapsTypeErPliktig,
        aarsavregningID,
        setFeilmelding,
        setAarsavregningResponse,
      });
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeilmelding, setAarsavregningResponse, aarsavregningID],
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 1000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  useEffect(() => {
    if (redigerbart && !isValidating && formIsValid && aarsavregningID) {
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [isValidating, aarsavregningID]);

  const stegErGyldig = Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const bekreftOnClick = () => {
    setBrukerHarBekreftet(true);
    if (stegErGyldig) {
      bekreft();
    }
  };

  const kallFeilet = (response: any): boolean => response.type === medlemskapsperioderTypes.FEILET;
  const mapFeil = (response: any) => response?.data?.data?.message;

  const lagreMedlemskapsperiode = async (medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
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
      console.log(response.data);
      setFeilmelding(mapFeil(response));
    } else {
      setFeilmelding(undefined);
    }

    console.log(response);
    console.log(feilmelding);

    medlemskapsperioderUpdate(index, mapTilMedlemskapsperiodeProps(response.data));
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (alleMedlemskapsperioder, overskrevetIndex) => {
      const isValid = await trigger("medlemskapsperioder");
      if (isValid) {
        // eslint-disable-next-line no-restricted-syntax
        for (const periode of alleMedlemskapsperioder) {
          const index = overskrevetIndex !== undefined ? overskrevetIndex : alleMedlemskapsperioder.indexOf(periode);
          await lagreMedlemskapsperiode(periode, index);
        }
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      }
    }, 1000),
    [],
  );

  const handleLeggTilMedlemskapsperiode = () => {
    const nyMedlemskapsperiode = {
      periodeId: Utils._uuid(),
      ny: true,
      fomDato: "",
      tomDato: "",
      innvilgelsesResultat: "",
      trygdedekning: "",
      bestemmelse: "",
    };
    // @ts-expect-error generisk beskrivelse
    medlemskapsperioderAppend(nyMedlemskapsperiode);
  };

  const handleSlett = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      medlemskapsperioderRemove(index);
    } else {
      dispatch(medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId));
    }
  };

  console.log(formErrors);
  return (
    <div className="vurderingAarsavregning">
      <TidligereGrunnlagsopplysningerFinnesIkke formValues={formValues} control={control} redigerbart={redigerbart} />

      {medlemskapsperioderFields.map((field, index) => (
        <Medlemskapsperioder
          redigerbart={redigerbart}
          control={control}
          field={field}
          index={index}
          remove={handleSlett}
          formValues={formValues}
          bestemmelser={bestemmelser}
          handleChange={debouncedLagreMedlemskapsperioder}
          handleUpdate={medlemskapsperioderUpdate}
          handleLeggTil={handleLeggTilMedlemskapsperiode}
          visLeggTil
          maksVerdi={valgtÅr !== undefined ? new Date(valgtÅr, 11, 31, 23, 59, 59, 999) : undefined}
          minVerdi={valgtÅr !== undefined ? new Date(valgtÅr, 0, 1) : undefined}
        />
      ))}

      <Skatteforholdsperioder
        formValues={formValues}
        redigerbart={redigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control}
        fields={skattFields}
      />
      <Inntektskilder
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

      {formIsValid && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        />
      )}

      {formIsValid && aarsavregningResponse?.nyttGrunnlag && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse.nyttGrunnlag}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          tittel="Endelig beregnet trygdeavgift"
        />
      )}

      {brukerHarBekreftet && <FeilmeldingOppsummering errors={formErrors} />}

      {feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      {formErrors.root && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {formErrors.root?.message}
        </Nav.Alert>
      )}

      <Nav.Button variant="primary" disabled={!redigerbart || !formIsValid} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
