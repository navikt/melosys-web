import "./tidligereGrunnlagsoversikt.css";
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Control, FieldArrayWithId, UseFieldArrayReturn, UseFieldArrayUpdate, UseFormTrigger } from "react-hook-form";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Medlemskapsperioder } from "./medlemskapsperioder";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import * as Api from "../../../../../services/api";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";
import * as Utils from "../../../../../utils";
import { MedlemskapsperiodeProp } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/types";
import MKV from "../../../../../melosyskodeverk";
import { mapTilMedlemskapsperiodeProps } from "../util/medlemskapsperiodeMapper";

interface GrunnlagsopplysningerSkjemaProps {
  behandlingID: number; // TODO from formvalues?
  formValues: FormValuesProps;
  trigger: UseFormTrigger<any>;
  medlemskapsperioderFields: UseFieldArrayReturn<FieldArrayProps, "medlemskapsperioder", "id">;
  erIngenGrunnlag: boolean | undefined;
  defaultPeriode?: { fomDato: string; tomDato: string };
  inntektFields: FieldArrayWithId<FieldArrayProps, "inntektskilder">[];
  skattFields: FieldArrayWithId<FieldArrayProps, "skatteforholdsperioder">[];
  control: Control;
  inntektUpdate: (index: number, inntektskilde: Inntektskilde) => void;
  inntektRemove: (index: number) => void;
  inntektAppend: (inntektskilde: Inntektskilde) => void;
  skattRemove: (index: number) => void;
  skattAppend: (skatteforhold: Skatteforhold) => void;
  redigerbart: boolean;
  medlemskapsTypeErPliktig: boolean;
}

function GrunnlagsopplysningerSkjema({
  behandlingID,
  formValues,
  trigger,
  medlemskapsperioderFields,
  erIngenGrunnlag,
  defaultPeriode,
  inntektFields,
  skattFields,
  control,
  inntektUpdate,
  inntektRemove,
  inntektAppend,
  skattRemove,
  skattAppend,
  redigerbart,
  medlemskapsTypeErPliktig,
}: GrunnlagsopplysningerSkjemaProps) {
  const dispatch = useDispatch();

  const [visLeggTilMedlemskapsperioder, setVisLeggTilMedlemskapsperioder] = useState<boolean>(false);
  const [bestemmelser, setBestemmelser] = useState<[]>([]);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);

  useEffect(() => {
    trigger("medlemskapsperioder").then((isValid) => setVisLeggTilMedlemskapsperioder(isValid));
    if (medlemskapsperioderFields.fields.length === 0) {
      handleLeggTilMedlemskapsperiode();
    }
  }, [medlemskapsperioderFields.fields]);

  useEffect(() => {
    if (behandlingstema) {
      Api.Ftrl.hentBestemmelser(behandlingstema).then((res: any) => setBestemmelser(res.bestemmelser));
    }
  }, [behandlingstema]);

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

    // @ts-ignore
    medlemskapsperioderFields.update(index, mapTilMedlemskapsperiodeProps(response.data));
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
        setVisLeggTilMedlemskapsperioder(true);
      } else {
        setVisLeggTilMedlemskapsperioder(false);
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
    medlemskapsperioderFields.append(nyMedlemskapsperiode);
    debouncedLagreMedlemskapsperioder(formValues.medlemskapsperioder, undefined);
  };

  const handleSlettMedlemskapsperiode = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index] as any;

    if (medlemskapsperiode.ny) {
      medlemskapsperioderFields.remove(index);
    } else {
      dispatch(medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId));
    }

    setVisLeggTilMedlemskapsperioder(await trigger("medlemskapsperioder"));
  };

  return (
    <div className="grunnlagsopplysningerSkjema">
      {erIngenGrunnlag &&
        medlemskapsperioderFields.fields.map((field, index) => (
          <Medlemskapsperioder
            redigerbart={redigerbart}
            control={control}
            field={field}
            index={index}
            remove={handleSlettMedlemskapsperiode}
            formValues={formValues}
            bestemmelser={bestemmelser}
            handleChange={debouncedLagreMedlemskapsperioder}
            handleUpdate={medlemskapsperioderFields.update}
            handleLeggTil={handleLeggTilMedlemskapsperiode}
            visLeggTil={visLeggTilMedlemskapsperioder}
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
    </div>
  );
}

export default GrunnlagsopplysningerSkjema;
