import { useSelector } from "react-redux";

import * as Api from "../../../../../services/api";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import MKV from "../../../../../melosyskodeverk";
import { useAsyncCallbackState } from "../../../../../hooks";
import * as Utils from "../../../../../utils";
import Dokumentliste from "../../../../../felleskomponenter/dokumentliste";

const { IKKE_YRKESAKTIV_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;

interface BrevMottakereTabellProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
}

export function BrevMottakereTabell({ innledningFritekst, begrunnelseFritekst }: BrevMottakereTabellProps) {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const [muligeMottakere] = useAsyncCallbackState(
    () =>
      Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
        orgnr: null,
      }),
    Api.DokumenterV2.tomHentMuligeMottakereResDto(),
    [],
  );

  const mapDokumenter = (muligmottaker: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      {
        mottakerNavn: muligmottaker.hovedMottaker.mottakerNavn,
        dokumentData: {
          produserbardokument: IKKE_YRKESAKTIV_VEDTAKSBREV,
          mottaker: muligmottaker.hovedMottaker.rolle,
          innledningFritekst,
          begrunnelseFritekst,
        },
      },
    ];
  };

  if (Utils._isEmpty(muligeMottakere)) return null;

  return <Dokumentliste behandlingID={behandlingID} dokumenter={mapDokumenter(muligeMottakere)} />;
}
