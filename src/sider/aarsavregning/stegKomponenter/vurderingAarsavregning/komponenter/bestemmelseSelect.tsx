import { useCallback } from "react";
import { Control, useWatch } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import { Inntektskilde } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../../utils";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

interface BestemmelseSelectProps {
  control: Control<any>;
  setValue: (name: string, value: any) => void;
  bestemmelser: string[];
  harDeltGrunnlag: boolean;
  behandlingID?: number;
  redigerbart: boolean;
  setTrygdedekninger: (trygdedekninger: string[]) => void;
  setFeilmelding: (feilmelding: string | undefined) => void;
  setEndrerBestemmelse: (isChanging: boolean) => void;
  lagreMedlemskapsperioder: (oppdaterteMedlemskapsperioder: Medlemskapsperiode[]) => void;
}

function BestemmelseSelect({
  control,
  setValue,
  bestemmelser,
  harDeltGrunnlag,
  behandlingID,
  redigerbart,
  setTrygdedekninger,
  setFeilmelding,
  setEndrerBestemmelse,
  lagreMedlemskapsperioder,
}: BestemmelseSelectProps) {
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  const handleBestemmelseChange = useCallback(
    async (nyBestemmelse: string) => {
      setEndrerBestemmelse(true);

      try {
        const trygdedekningerResponse = await Api.LovligeKombinasjoner.hentTrygdedekninger(nyBestemmelse);
        setTrygdedekninger(trygdedekningerResponse);

        if (medlemskapsperioder.every((periode: Medlemskapsperiode) => periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID)) {
          setEndrerBestemmelse(false);
          return;
        }

        try {
          await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperioder(behandlingID!);
        } catch (error) {
          setFeilmelding("Feil ved sletting av medlemskapsperioder");
          setEndrerBestemmelse(false);
          return;
        }

        const defaultTrygdedekning = trygdedekningerResponse.length === 1 ? trygdedekningerResponse[0] : "";

        const oppdaterteMedlemskapsperioder = medlemskapsperioder.map((periode: Medlemskapsperiode) => ({
          ...periode,
          trygdedekning: defaultTrygdedekning,
          id: ULAGRET_MEDLEMSKAPSPERIODE_ID,
        }));
        setValue("medlemskapsperioder", oppdaterteMedlemskapsperioder);

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

        lagreMedlemskapsperioder(oppdaterteMedlemskapsperioder);
      } catch (error) {
        setFeilmelding("Feil ved endring av bestemmelse");
      }
    },
    [
      harDeltGrunnlag,
      medlemskapsperioder,
      inntektskilder,
      setValue,
      setTrygdedekninger,
      setFeilmelding,
      setEndrerBestemmelse,
    ],
  );

  return (
    <Forms.Select
      name="bestemmelse"
      label="Bestemmelse"
      aria-label="Bestemmelse"
      control={control}
      readOnly={!redigerbart || harDeltGrunnlag}
      onChange={(valgtBestemmelse) => {
        if (valgtBestemmelse && valgtBestemmelse !== bestemmelse) {
          handleBestemmelseChange(valgtBestemmelse);
        }
      }}
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
