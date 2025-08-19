import { RootState } from "AppTypes";
import { getFormValues } from "redux-form";
import { connect, ConnectedProps } from "react-redux";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../skjema";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";
import { SendBrevFormValues } from "../types";
import { erBruker } from "./brevMottaker";
import Dokumentliste, { BrevDokumentMetadataType } from "../../../dokumentliste";
import BrevVedlegg, { Fritekstvedlegg } from "../brevVedlegg/brevVedlegg";
import {
  BrevVedleggInterface,
  BrevVedleggVisningstabellInterface,
  FeilmeldingProps,
  FysiskDokument,
} from "../../../../services/modules/dokumenter-v2";

import "./brevMottakereTabell.less";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface BrevMottakereTabellProps {
  muligeMottakere?: Api.DokumenterV2.HentMuligeMottakereResDto;
  muligeMottakereNorskMyndighet?: Api.DokumenterV2.MuligMottaker[];
  formIsValid: boolean;
  hentBrevRequest: (rolle: string) => Record<string, unknown>;
  standardvedlegg: Api.DokumenterV2.TilgjengeligStandardvedlegg[];
  fritekstvedlegg: Fritekstvedlegg[];
  setFritekstvedlegg: (fritekstvedlegg: Fritekstvedlegg[]) => void;
  valgteVedlegg: BrevVedleggInterface;
  setValgteVedlegg: (valgteVedlegg: BrevVedleggVisningstabellInterface) => void;
  changeField: (field: string, value: string) => void;
  redigerbart: boolean;
  dokumenter: FysiskDokument[];
  visFritekstvedleggSkjema: boolean;
  setVisFritekstvedleggSkjema: (value: boolean) => void;
  redigerFritekstvedleggIndex?: number;
  setRedigerFritekstvedleggIndex: (value: number | undefined) => void;
}

function BrevMottakereTabell({
  muligeMottakere,
  muligeMottakereNorskMyndighet,
  behandlingID,
  formValues,
  formIsValid,
  hentBrevRequest,
  fritekstvedlegg,
  setFritekstvedlegg,
  valgteVedlegg,
  setValgteVedlegg,
  changeField,
  redigerbart,
  dokumenter,
  visFritekstvedleggSkjema,
  setVisFritekstvedleggSkjema,
  redigerFritekstvedleggIndex,
  setRedigerFritekstvedleggIndex,
  standardvedlegg,
}: BrevMottakereTabellProps & PropsFromRedux) {
  const valgtMottakerHarFeilmelding: FeilmeldingProps | undefined = formValues?.valgtMottaker?.feilmelding;
  const mottakerErNorskMyndighet = formValues?.valgtMottaker?.rolle === "NORSK_MYNDIGHET";

  const harStandardVedlegg =
    formValues?.valgtMottaker?.rolle === "BRUKER" && formValues?.felt?.DISTRIBUSJONSTYPE?.valg === "VEDTAK";
  const standardvedleggTilVisning = harStandardVedlegg ? standardvedlegg : [];

  const mapKopiMottakere = (
    muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto,
  ): BrevDokumentMetadataType[] => {
    return formValues?.kopiTilBruker
      ? muligeBrevMottakere.kopiMottakere.map((muligMottaker) => mapDokument(muligMottaker))
      : [];
  };

  const mapDokument = (
    muligMottaker: Api.DokumenterV2.MuligMottaker,
    erHovedMottaker = false,
  ): BrevDokumentMetadataType => {
    const rolle = erHovedMottaker ? formValues.valgtMottaker?.rolle : muligMottaker.rolle;
    return {
      mottakerNavn: muligMottaker.mottakerNavn,
      dokumentNavn: muligMottaker.dokumentNavn,
      dokumentData: {
        produserbardokument: "",
        mottaker: muligMottaker.mottakerNavn,
        ...(rolle ? hentBrevRequest(rolle) : {}),
        ...(!erBruker(rolle) && muligMottaker.orgnr ? { orgNr: muligMottaker.orgnr } : {}),
      },
    };
  };

  const mapMottakerRader = (
    muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto,
  ): BrevDokumentMetadataType[] => {
    return [
      mapDokument(muligeBrevMottakere.hovedMottaker, true),
      ...mapKopiMottakere(muligeBrevMottakere),
      ...muligeBrevMottakere.fasteMottakere.map((fastMottaker) => mapDokument(fastMottaker)),
    ];
  };

  return (
    <>
      {!Utils._isEmpty(muligeMottakere?.kopiMottakere) && (
        <Skjema.Checkbox
          className="kopiTilBrukerSjekkboks"
          feltNavn="kopiTilBruker"
          label="Send kopi til bruker/brukers fullmektig"
        />
      )}

      {muligeMottakere && (
        <Dokumentliste
          behandlingID={behandlingID}
          dokumenter={mapMottakerRader(muligeMottakere)}
          label={"Forhåndsvisning av brev og vedlegg"}
          className="dokumentliste--no-bottom-margin"
          validateOnClick={() => formIsValid}
        />
      )}

      {muligeMottakereNorskMyndighet && (
        <Dokumentliste
          behandlingID={behandlingID}
          dokumenter={muligeMottakereNorskMyndighet.map((muligMottaker) => mapDokument(muligMottaker))}
          label={"Forhåndsvisning av brev og vedlegg"}
          className="dokumentliste--no-bottom-margin"
        />
      )}

      {!valgtMottakerHarFeilmelding && (
        <BrevVedlegg
          fritekstvedlegg={fritekstvedlegg}
          setFritekstvedlegg={setFritekstvedlegg}
          valgteVedlegg={valgteVedlegg}
          setValgteVedlegg={setValgteVedlegg}
          changeField={changeField}
          formValues={formValues}
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          dokumenter={dokumenter}
          mottakerErNorskMyndighet={mottakerErNorskMyndighet}
          visFritekstvedleggSkjema={visFritekstvedleggSkjema}
          setVisFritekstvedleggSkjema={setVisFritekstvedleggSkjema}
          redigerFritekstvedleggIndex={redigerFritekstvedleggIndex}
          setRedigerFritekstvedleggIndex={setRedigerFritekstvedleggIndex}
          muligeMottakere={muligeMottakere}
          standardvedlegg={standardvedleggTilVisning}
        />
      )}
    </>
  );
}

export default connector(BrevMottakereTabell);
