import { useCallback } from "react";
import { Control, useWatch } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import { Inntektskilde } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../../utils";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import { MedlemskapsperiodeFieldProps } from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";

export const skalSletteEksisterendePerioder = (perioder: MedlemskapsperiodeFieldProps[]): boolean =>
  perioder.some((periode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID);

interface BestemmelseSelectProps {
  control: Control<any>;
  setValue: (name: string, value: any) => void;
  bestemmelser: string[];
  behandlingID?: number;
  redigerbart: boolean;
  setTrygdedekninger: (trygdedekninger: string[]) => void;
  setFeilmelding: (feilmelding: string | undefined) => void;
  setEndrerBestemmelse: (isChanging: boolean) => void;
  lagreMedlemskapsperioderHvisGyldig: (oppdaterteMedlemskapsperioder: MedlemskapsperiodeFieldProps[]) => void;
  harLaasteMedlemskapsperioder: boolean;
}

function BestemmelseSelect({
  control,
  setValue,
  bestemmelser,
  behandlingID,
  redigerbart,
  setTrygdedekninger,
  setFeilmelding,
  setEndrerBestemmelse,
  lagreMedlemskapsperioderHvisGyldig,
  harLaasteMedlemskapsperioder,
}: BestemmelseSelectProps) {
  const avgiftspliktigperioder = useWatch({ control, name: "avgiftspliktigperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  const handleBestemmelseChange = useCallback(
    async (nyBestemmelse: string) => {
      setEndrerBestemmelse(true);

      try {
        const trygdedekningerResponse = await Api.LovligeKombinasjoner.hentTrygdedekninger(nyBestemmelse);
        setTrygdedekninger(trygdedekningerResponse);

        try {
          if (skalSletteEksisterendePerioder(avgiftspliktigperioder)) {
            await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperioder(behandlingID!);
          }
        } catch (error) {
          setFeilmelding("Feil ved sletting av medlemskapsperioder");
          setEndrerBestemmelse(false);
          return;
        }

        const defaultTrygdedekning = trygdedekningerResponse.length === 1 ? trygdedekningerResponse[0] : "";

        const oppdaterteMedlemskapsperioder = avgiftspliktigperioder.map((periode: MedlemskapsperiodeFieldProps) => ({
          ...periode,
          trygdedekning: defaultTrygdedekning,
          id: ULAGRET_MEDLEMSKAPSPERIODE_ID,
        }));
        setValue("avgiftspliktigperioder", oppdaterteMedlemskapsperioder);

        setValue(
          "inntektskilder",
          inntektskilder.map((kilde: Inntektskilde) => ({
            fomDato: kilde.fomDato,
            tomDato: kilde.tomDato,
            kildetype: "",
            arbAvgBetales: Utils.streng.boolTilUppercaseStreng(false),
            bruttoInntekt: "",
            erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(true),
          })),
        );

        lagreMedlemskapsperioderHvisGyldig(oppdaterteMedlemskapsperioder);
      } catch (error) {
        setFeilmelding("Feil ved endring av bestemmelse");
      }
    },
    [
      avgiftspliktigperioder,
      inntektskilder,
      setValue,
      setTrygdedekninger,
      setFeilmelding,
      setEndrerBestemmelse,
      lagreMedlemskapsperioderHvisGyldig,
    ],
  );

  return (
    <Forms.Select
      name="bestemmelse"
      label="Bestemmelse"
      aria-label="Bestemmelse"
      control={control}
      readOnly={!redigerbart || harLaasteMedlemskapsperioder}
      emptyFieldDisabled
      onChange={(valgtBestemmelse) => {
        handleBestemmelseChange(valgtBestemmelse);
      }}
      className="bestemmelseSelect"
    >
      {bestemmelser.map((bestemmelseKode: string) => (
        <option key={bestemmelseKode} value={bestemmelseKode}>
          {KV.kodeTilTerm(bestemmelseKode, [
            ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
            ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
          ] as string[])}
        </option>
      ))}
    </Forms.Select>
  );
}
export default BestemmelseSelect;
