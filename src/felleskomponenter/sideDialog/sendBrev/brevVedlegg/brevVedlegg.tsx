import { useState } from "react";
import { FysiskDokument } from "Domene";
import { ColumnWidth } from "nav-frontend-grid";

import * as Ikoner from "../../../../resources/images";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../ui";
import MKV from "../../../../melosyskodeverk";
import { dokumenterOperations } from "../../../../ducks/dokumenter";
import VedleggTable from "../../../vedleggTable";
import VedleggVelger from "../../../vedleggvelger";
import FritekstvedleggSkjema from "./fritekstvedleggSkjema";

const FORHANDSVIS_ERROR_MESSAGE = "Det oppstod en feil da vedlegget skulle forhåndsvises";

export type Fritekstvedlegg = {
  tittel: string;
  fritekst: string;
};

interface BrevVedleggProps {
  fritekstvedlegg: Fritekstvedlegg[];
  setFritekstvedlegg: (fritekstvedlegg: Fritekstvedlegg[]) => void;
  valgteVedlegg: FysiskDokument[];
  setValgteVedlegg: (valteVedlegg: FysiskDokument[]) => void;
  changeField: (field: string, value: string) => void;
  formValues: any;
  redigerbart: boolean;
  behandlingID: number;
  felterWidth?: ColumnWidth;
  dokumenter: FysiskDokument[];
  mottakerErNorskMyndighet: boolean;
  muligeMottakere?: Api.DokumenterV2.HentMuligeMottakereResDto;
  visFritekstvedleggSkjema: boolean;
  setVisFritekstvedleggSkjema: (value: boolean) => void;
  redigerFritekstvedleggIndex?: number;
  setRedigerFritekstvedleggIndex: (value: number | undefined) => void;
}

const BrevVedlegg = ({
  fritekstvedlegg,
  setFritekstvedlegg,
  valgteVedlegg,
  setValgteVedlegg,
  changeField,
  formValues,
  redigerbart,
  behandlingID,
  felterWidth = "12",
  dokumenter,
  mottakerErNorskMyndighet,
  muligeMottakere,
  visFritekstvedleggSkjema,
  setVisFritekstvedleggSkjema,
  redigerFritekstvedleggIndex,
  setRedigerFritekstvedleggIndex,
}: BrevVedleggProps) => {
  const [forhandsvisFritekstvedleggError, setForhandsvisFritekstvedleggError] = useState(false);

  const lagFritekstPdfUrl = async (index: number) => {
    const data = {
      produserbardokument: MKV.Koder.brev.produserbaredokumenter.GENERELT_FRITEKSTVEDLEGG,
      mottaker: mottakerErNorskMyndighet
        ? MKV.Koder.mottakerroller.NORSK_MYNDIGHET
        : muligeMottakere?.hovedMottaker.rolle || "",
      fritekstTittel:
        redigerFritekstvedleggIndex === index
          ? formValues.felt?.FRITEKSTVEDLEGG_TITTEL?.feltVerdi
          : fritekstvedlegg[index].tittel,
      fritekst:
        redigerFritekstvedleggIndex === index
          ? formValues.felt?.FRITEKSTVEDLEGG_FRITEKST?.feltVerdi
          : fritekstvedlegg[index].fritekst,
      kontaktopplysninger: false,
      institusjonID: formValues.felt?.UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER?.valg,
    };
    try {
      setForhandsvisFritekstvedleggError(false);
      return await dokumenterOperations.forhandsvisBrevV2(behandlingID, data);
    } catch (e) {
      setForhandsvisFritekstvedleggError(true);
      return "";
    }
  };

  const resetFritekstvedlegg = () => {
    changeField("felt.FRITEKSTVEDLEGG_TITTEL.feltVerdi", "");
    changeField("felt.FRITEKSTVEDLEGG_FRITEKST.feltVerdi", "");
    setVisFritekstvedleggSkjema(false);
    setRedigerFritekstvedleggIndex(undefined);
  };

  const leggTilFritekstvedlegg = () => {
    const tittel = formValues.felt?.FRITEKSTVEDLEGG_TITTEL?.feltVerdi;
    const fritekst = formValues.felt?.FRITEKSTVEDLEGG_FRITEKST?.feltVerdi;
    if (tittel && fritekst && fritekst !== "<p></p>\n") {
      const newFritekstvedlegg = [...fritekstvedlegg];
      if (redigerFritekstvedleggIndex !== undefined) {
        newFritekstvedlegg[redigerFritekstvedleggIndex] = { tittel, fritekst };
      } else {
        newFritekstvedlegg.push({ tittel, fritekst });
      }
      setFritekstvedlegg(newFritekstvedlegg);
      changeField("felt.FRITEKSTVEDLEGG_TITTEL.feltVerdi", "");
      changeField("felt.FRITEKSTVEDLEGG_FRITEKST.feltVerdi", "");
      setVisFritekstvedleggSkjema(false);
      setRedigerFritekstvedleggIndex(undefined);
    }
  };

  const redigerFritekstvedlegg = (index: number) => {
    const vedlegg = fritekstvedlegg[index];
    changeField("felt.FRITEKSTVEDLEGG_TITTEL.feltVerdi", vedlegg.tittel);
    changeField("felt.FRITEKSTVEDLEGG_FRITEKST.feltVerdi", vedlegg.fritekst);
    setRedigerFritekstvedleggIndex(index);
    setVisFritekstvedleggSkjema(true);
  };

  const slettFritekstvedlegg = (index: number) => {
    const newFritekstvedlegg = [...fritekstvedlegg];
    newFritekstvedlegg.splice(index, 1);
    setFritekstvedlegg(newFritekstvedlegg);
    if (index === redigerFritekstvedleggIndex) {
      setRedigerFritekstvedleggIndex(undefined);
    }
    if (redigerFritekstvedleggIndex && index < redigerFritekstvedleggIndex) {
      setRedigerFritekstvedleggIndex(redigerFritekstvedleggIndex - 1);
    }
  };

  const vedleggFelt = formValues.valgtBrev?.felter?.find(
    (felt: any) => felt.kode === Api.DokumenterV2.FeltType.VEDLEGG
  );
  const fritekstvedleggFelt = formValues.valgtBrev?.felter?.find(
    (felt: any) => felt.kode === Api.DokumenterV2.FeltType.FRITEKSTVEDLEGG
  );

  return (
    <>
      {forhandsvisFritekstvedleggError && (
        <Nav.AlertStripe type="advarsel" className="varsel">
          {FORHANDSVIS_ERROR_MESSAGE}
        </Nav.AlertStripe>
      )}

      {(vedleggFelt || fritekstvedleggFelt) && (
        <VedleggTable
          valgteVedlegg={valgteVedlegg}
          fritekstvedlegg={fritekstvedlegg}
          redigerFritekstvedlegg={redigerFritekstvedlegg}
          slettFritekstvedlegg={slettFritekstvedlegg}
          lagFritekstPdfUrl={lagFritekstPdfUrl}
          setValgteVedlegg={setValgteVedlegg}
          label="Vedlegg"
        />
      )}

      {vedleggFelt && (
        <VedleggVelger dokumenter={dokumenter} valgteVedlegg={valgteVedlegg} onChange={setValgteVedlegg} />
      )}

      {fritekstvedleggFelt &&
        (visFritekstvedleggSkjema ? (
          <FritekstvedleggSkjema
            felt={fritekstvedleggFelt}
            index={redigerFritekstvedleggIndex}
            resetFritekstvedlegg={resetFritekstvedlegg}
            leggTilFritekstvedlegg={leggTilFritekstvedlegg}
            width={felterWidth}
          />
        ) : (
          <Mui.Lenkeknapp
            className="fritekstvedlegg__knapp"
            disabled={!redigerbart}
            onClick={() => setVisFritekstvedleggSkjema(true)}
            ikon={Ikoner.Add}
          >
            {fritekstvedleggFelt.beskrivelse}
          </Mui.Lenkeknapp>
        ))}
    </>
  );
};

export default BrevVedlegg;
