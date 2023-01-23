import React from "react";
import { RootState } from "AppTypes";
import { getFormValues } from "redux-form";
import { connect, ConnectedProps } from "react-redux";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";
import MottakerTabell from "../../../tabell/mottakerTabell";
import { erArbeidsgiverEllerVirksomhet } from "./brevMottaker";
import PdfLenkeListe from "../../../pdfLenkeListe";
import { SendBrevFormValues } from "../types";

const { BRUKER } = KV.Koder.MottakerRolle;

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface BrevMottakereTabellProps {
  muligeMottakere?: Api.DokumenterV2.HentMuligeMottakereResDto;
  muligeMottakereEtater?: Api.DokumenterV2.MuligMottaker[];
  formIsValid: boolean;
  valgtMottaker: any;
  hentBrevRequest: any;
}

const BrevMottakereTabell = ({
  muligeMottakere,
  muligeMottakereEtater,
  valgtMottaker,
  behandlingID,
  formValues,
  formIsValid,
  hentBrevRequest,
}: BrevMottakereTabellProps & PropsFromRedux) => {
  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, ikon?: boolean) => {
    const orgnrFraFormValues = valgtMottaker.orgnrSettesAvSaksbehandler
      ? formValues.organisasjonsnummer
      : formValues.arbeidsgiver;

    return [
      {
        sendesTilDokumenterV2: true,
        navn: ikon ? <Ikoner.Forhandsvis /> : muligMottaker.dokumentNavn,
        data: {
          ...hentBrevRequest(muligMottaker.rolle),
          orgNr: muligMottaker.rolle !== BRUKER ? muligMottaker.orgnr || orgnrFraFormValues : null,
          kontaktpersonNavn:
            erArbeidsgiverEllerVirksomhet(muligMottaker.rolle) && valgtMottaker.orgnrSettesAvSaksbehandler
              ? formValues.kontaktperson
              : null,
        },
      },
    ];
  };

  const mapRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
    ];
  };

  const mapKopiMottakere = (muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return formValues?.kopimottaker
      ? muligeBrevMottakere.kopiMottakere.map((muligMottaker) => mapRad(muligMottaker))
      : [];
  };

  const mapMottakerRader = (muligeBrevMottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapRad(muligeBrevMottakere.hovedMottaker),
      ...mapKopiMottakere(muligeBrevMottakere),
      ...muligeBrevMottakere.fasteMottakere.map((muligMottaker) => mapRad(muligMottaker)),
    ];
  };

  const mapMottakerRaderEtater = (muligeBrevMottakere: Api.DokumenterV2.MuligMottaker[]) => {
    return muligeBrevMottakere.map((mottaker) => mapRad(mottaker));
  };

  return (
    <>
      {muligeMottakere?.kopiMottakere?.length !== 0 && (
        <Skjema.Checkbox
          className="kopimottakerSjekkboks"
          feltNavn="kopimottaker"
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
      {muligeMottakereEtater && (
        <MottakerTabell
          className="tabell"
          rader={mapMottakerRaderEtater(muligeMottakereEtater)}
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
