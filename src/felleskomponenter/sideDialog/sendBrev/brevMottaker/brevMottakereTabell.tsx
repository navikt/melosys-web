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
  hentBrevRequest: any;
}

function BrevMottakereTabell({
  muligeMottakere,
  muligeMottakereNorskMyndighet,
  behandlingID,
  formValues,
  formIsValid,
  hentBrevRequest,
}: BrevMottakereTabellProps & PropsFromRedux) {
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
        ...hentBrevRequest(rolle),
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
          validateOnClick={() => formIsValid}
        />
      )}
      {muligeMottakereNorskMyndighet && (
        <Dokumentliste
          behandlingID={behandlingID}
          dokumenter={muligeMottakereNorskMyndighet.map((muligMottaker) => mapDokument(muligMottaker))}
        />
      )}
    </>
  );
}

export default connector(BrevMottakereTabell);
