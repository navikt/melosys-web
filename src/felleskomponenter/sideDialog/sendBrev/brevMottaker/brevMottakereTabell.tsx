import { RootState } from "AppTypes";
import { getFormValues } from "redux-form";
import { connect, ConnectedProps } from "react-redux";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../skjema";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";
import MottakerTabell from "../../../tabell/mottakerTabell";
import PdfLenkeListe from "../../../pdfLenkeListe";
import { SendBrevFormValues } from "../types";
import { erBruker } from "./brevMottaker";

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

const BrevMottakereTabell = ({
  muligeMottakere,
  muligeMottakereNorskMyndighet,
  behandlingID,
  formValues,
  formIsValid,
  hentBrevRequest,
}: BrevMottakereTabellProps & PropsFromRedux) => {
  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, erHovedMottaker: boolean) => {
    const rolle = erHovedMottaker ? formValues.valgtMottaker?.rolle : muligMottaker.rolle;
    return [
      {
        navn: muligMottaker.dokumentNavn,
        data: {
          ...hentBrevRequest(rolle),
          ...(!erBruker(rolle) && muligMottaker.orgnr ? { orgNr: muligMottaker.orgnr } : {}),
        },
      },
    ];
  };

  const mapRad = (muligMottaker: Api.DokumenterV2.MuligMottaker, erHovedMottaker: boolean = false) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker, erHovedMottaker)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
    ];
  };

  const mapKopiMottakere = (muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return formValues?.kopiTilBruker
      ? muligeBrevMottakere.kopiMottakere.map((muligMottaker) => mapRad(muligMottaker))
      : [];
  };

  const mapMottakerRader = (muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapRad(muligeBrevMottakere.hovedMottaker, true),
      ...mapKopiMottakere(muligeBrevMottakere),
      ...muligeBrevMottakere.fasteMottakere.map((muligMottaker) => mapRad(muligMottaker)),
    ];
  };

  const mapMottakerRaderNorskeMyndigheter = (muligeBrevMottakere: Api.DokumenterV2.MuligMottaker[]) => {
    return muligeBrevMottakere.map((mottaker) => mapRad(mottaker));
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
        <MottakerTabell
          className="tabell"
          rader={mapMottakerRader(muligeMottakere)}
          kolonner={[
            { verdi: "Forhåndsvisning av brev", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}
      {muligeMottakereNorskMyndighet && (
        <MottakerTabell
          className="tabell"
          rader={mapMottakerRaderNorskeMyndigheter(muligeMottakereNorskMyndighet)}
          kolonner={[
            { verdi: "Forhåndsvisning av brev", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}
    </>
  );
};

export default connector(BrevMottakereTabell);
