import { useCallback } from "react";
import { Control, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";
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
}: BestemmelseSelectProps) {
  const dispatch = useDispatch();
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  const handleBestemmelseChange = useCallback(
    async (nyBestemmelse: string) => {
      try {
        if (!harDeltGrunnlag && behandlingID) {
          try {
            await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperioder(behandlingID);

            // Refresh medlemskapsperioder in Redux store
            dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
          } catch (error) {
            setFeilmelding("Feil ved sletting av medlemskapsperioder");
            return;
          }
        }

        const trygdedekningerResponse = await Api.LovligeKombinasjoner.hentTrygdedekninger(nyBestemmelse);
        setTrygdedekninger(trygdedekningerResponse);

        setValue(
          "medlemskapsperioder",
          medlemskapsperioder.map((periode: Medlemskapsperiode) => ({
            ...periode,
            trygdedekning: "",
            id: ULAGRET_MEDLEMSKAPSPERIODE_ID,
          })),
        );

        setValue(
          "inntektskilder",
          inntektskilder.map((kilde: Inntektskilde) => ({
            fomDato: kilde.fomDato,
            tomDato: kilde.tomDato,
            kildetype: "",
            arbAvgBetales: "",
            bruttoInntekt: "",
            erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(true),
          })),
        );
      } catch (error) {
        setFeilmelding("Feil ved endring av bestemmelse");
      }
    },
    [
      harDeltGrunnlag,
      behandlingID,
      dispatch,
      medlemskapsperioder,
      inntektskilder,
      setValue,
      setTrygdedekninger,
      setFeilmelding,
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
