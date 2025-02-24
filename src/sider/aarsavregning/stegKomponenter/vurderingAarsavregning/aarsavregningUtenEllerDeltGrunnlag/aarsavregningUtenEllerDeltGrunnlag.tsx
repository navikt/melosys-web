import * as Api from "../../../../../services/api";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import * as Nav from "../../../../../navFrontend";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { TidligereFakturertIAvgiftssystemetInput } from "../komponenter/tidligereFakturertIAvgiftssystemetInput";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
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
import { MedlemskapsperiodeProp } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/types";
import { FeilmeldingOppsummering } from "../feilmeldingOppsummering";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import {
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  harIkkeSkattepliktigInntektskilder,
  fomTomEralltidFyltUt,
  validerMedlemskapsperioder,
} from "../komponenter/utils";
import {
  hentMedlemskapsFomTomDato,
  mapInitialMedlemskapsperioder,
  mapTilInntektskilderProps,
  mapTilMedlemskapsperiodeProps,
  mapTilSkatteforholdProps,
} from "../aarsavregningHelpers";
import { MedlemskapsperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";

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
          setValue("totaltForskuddsvisFakturert", res.avregning?.tidligereFakturertBeloepAvgiftssystem);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setAarsavregningResponse(undefined);
          }
        });
    }
  }, []);

  useEffect(() => {
    const validerMedlemskapsperioderResultat = validerMedlemskapsperioder(lagredeMedlemskapsperioder);
    setFeilmelding(validerMedlemskapsperioderResultat);

    if (lagredeMedlemskapsperioder) {
      const mappedLagredeMedlemskapsperioder = mapInitialMedlemskapsperioder(
        lagredeMedlemskapsperioder,
        aarsavregningResponse?.tidligereGrunnlagsopplysninger,
      );
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
    resolver: yupResolver(aarsavregningUtenEllerDeltGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig,
      aar: valgtÅr,
    },
    mode: "onChange",
    defaultValues: {
      medlemskapsperioder: mapInitialMedlemskapsperioder(
        lagredeMedlemskapsperioder,
        aarsavregningResponse?.tidligereGrunnlagsopplysninger,
      ),
      skatteforholdsperioder: mapTilSkatteforholdProps(
        aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
      ),
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

  const debouncedOppdaterAarsavregning = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        Api.Aarsavregning.oppdaterAarsavregning(behandlingID, request, aarsavregningID),
      1000,
    ),
    [behandlingID, aarsavregningID],
  );

  useEffect(() => {
    if (
      redigerbart &&
      (formValues.totaltForskuddsvisFakturert || formValues.totaltForskuddsvisFakturert === "") &&
      formValues.totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
    ) {
      debouncedOppdaterAarsavregning({
        avregning: {
          tidligereFakturertBeloepAvgiftssystem: formValues.totaltForskuddsvisFakturert,
        },
      });
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
    if (
      fomTomEralltidFyltUt(formValues.inntektskilder, formValues.skatteforholdsperioder) &&
      redigerbart &&
      !isValidating &&
      formIsValid &&
      aarsavregningID
    ) {
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [formIsValid, isValidating]);

  const stegErGyldig = Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag && feilmelding === undefined);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const bekreftOnClick = () => {
    setBrukerHarBekreftet(true);
    if (stegErGyldig) {
      bekreft();
    }
  };

  const harMedlemskapsPeriodeFeil = (response: any): boolean => response.type === medlemskapsperioderTypes.FEILET;

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

    if (harMedlemskapsPeriodeFeil(response)) {
      setFeilmelding(response?.data?.data?.message);
    } else {
      setFeilmelding(undefined);
    }

    medlemskapsperioderUpdate(
      index,
      mapTilMedlemskapsperiodeProps(response.data, aarsavregningResponse?.tidligereGrunnlagsopplysninger),
    );
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
      redigerbar: true,
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

  const harIkkeskattepliktigInntektskilder =
    harDeltGrunnlag &&
    harIkkeSkattepliktigInntektskilder(
      aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
      aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder,
      medlemskapsTypeErPliktig,
    );

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);

  return (
    <div className="vurderingAarsavregning">
      {harDeltGrunnlag && (
        <>
          <MedlemskapsPerioderTabell
            perioder={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <TidligereGrunnlagsoversikt
            harFakturerbareInntektskilder={harIkkeskattepliktigInntektskilder}
            skatteforholdsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
            }
            avgift={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift}
          />
        </>
      )}

      {harIkkeskattepliktigInntektskilder && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          tittel="Tidligere beregnet trygdeavgift"
        />
      )}

      <TidligereFakturertIAvgiftssystemetInput
        formValues={formValues}
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
            handleChange={debouncedLagreMedlemskapsperioder}
            handleUpdate={medlemskapsperioderUpdate}
            handleLeggTil={handleLeggTilMedlemskapsperiode}
            visLeggTil
            maksVerdi={valgtÅr !== undefined ? new Date(valgtÅr, 11, 31, 23, 59, 59, 999) : undefined}
            minVerdi={valgtÅr !== undefined ? new Date(valgtÅr, 0, 1) : undefined}
          />
        ))}
      </div>

      <Skatteforholdsperioder
        formValues={formValues}
        redigerbart={redigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control}
        fields={skattFields}
      />
      {!trygdeAvgiftSkalIkkeBetalesTilNav && (
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
      )}
      {trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Nav.Alert variant="info" className="alertstripe_feilmelding">
          Trygdeavgift skal ikke betales til NAV
        </Nav.Alert>
      )}

      {formIsValid && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
          tidligereTrygdeavgiftAvgiftssystem={aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem}
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

      <Nav.Button variant="primary" disabled={!redigerbart || !stegErGyldig} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
