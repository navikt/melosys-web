import * as Nav from "../../../../navFrontend";
import "./vurderingVedtak.css";
import * as Mui from "../../../../felleskomponenter/ui";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../felleskomponenter/dokumentliste";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { useSelector } from "react-redux";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import * as Utils from "../../../../utils";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { useRangeDatepicker } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import Datovelger from "../../../../felleskomponenter/datovelger";
import feilmeldinger from "../../../../felleskomponenter/feilmeldinger/feilmeldinger";

type VurderingVedtakProps = {
  tilbake: () => void;
  redigerbart: boolean;
  pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[];
  harFeilmeldinger: boolean;
  aktivtSteg?: boolean;
  validerMottatteOpplysninger: () => Promise<void>;
};

export const VurderingVedtak11_3_og_13_3a = ({
  redigerbart,
  tilbake,
  pdfDokumenter,
  harFeilmeldinger,
  aktivtSteg = false,
  validerMottatteOpplysninger,
}: VurderingVedtakProps) => {
  const [muligeLovvalgsbestemmelser] = useState<any>([
    KV.kodeTilObjekt(
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004
    ),

    KV.kodeTilObjekt(
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_3A,
      MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia
    ),
  ]);
  const [lovvalgsbestemmelse, setLovvalgsbestemmelse] = useState([]);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const stegErGyldig = redigerbart; // && formIsValid && !harFeilmeldinger && !flereSoknadslandEnnTillatt;

  const fom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);
  const tom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom);
  useEffect(() => {}, []);

  const mapDokumenter = (dokumenter: BrevDokumentMetadataType[]) => {
    return dokumenter.map((dokument: BrevDokumentMetadataType) => {
      return dokument;
    });
  };

  let skalViseLovvalg = false;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      skalViseLovvalg = true
    }
  };

  const oppdaterFom = () => {
    console.log("test")
  }

  console.log({ tilbake, pdfDokumenter, harFeilmeldinger, aktivtSteg, validerMottatteOpplysninger });

  return (
    <div className="vedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Omfattet av norsk trygdelovgivning</Nav.Typo.Innholdstittel>
      <Mui.KodeTermSelect
        onChange={(e) => setLovvalgsbestemmelse(e.target.value)}
        label="Velg en lovvalgsbestemmelse"
        value={lovvalgsbestemmelse}
        koder={muligeLovvalgsbestemmelser}
        redigerbart={redigerbart}
        disableForsteValg
        className="ktselect__slim"
      />

      <Nav.Typo.Element className="undertittel">Søknadsperiode</Nav.Typo.Element>
      <Nav.Column>
        {fom} - {tom}
      </Nav.Column>

      <Nav.Checkbox
        key="korterePeriode"
        onChange={(a) => {
          handleCheckboxChange(a.target.checked);
        }}
      >
        Lovvalget innvilges for en kortere periode
      </Nav.Checkbox>


      {skalViseLovvalg && (
          <Nav.HStack>
            <Datovelger label="Startdato"
                        value={Utils.dato.norskStringTilDate(fom)}
                        onChange={oppdaterFom}
                        feil={feilmeldinger.name}
                        disabled={!redigerbart}>
            </Datovelger>
            <Datovelger label="Sluttdato">
            </Datovelger>
          </Nav.HStack>
      )}
      <Nav.Row>
        <Nav.Column xs="7">
          {stegErGyldig && (
            <Dokumentliste
              behandlingID={behandlingID}
              dokumenter={mapDokumenter(pdfDokumenter as BrevDokumentMetadataType[])}
            />
          )}
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};
