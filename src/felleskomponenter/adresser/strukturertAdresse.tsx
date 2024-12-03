import * as Api from "../../services/api";

interface StrukturertAdresseProps {
  adresse: Partial<Api.StrukturertAdresse>;
}

function StrukturertAdresse({
  adresse: {
    tilleggsnavn,
    gatenavn,
    husnummerEtasjeLeilighet,
    region,
    postboks,
    postnummer,
    poststed,
    landkode,
    coAdressenavn,
  },
}: StrukturertAdresseProps) {
  return (
    <address>
      <div>{coAdressenavn}</div>
      <div>{tilleggsnavn}</div>
      <div>
        {gatenavn} {husnummerEtasjeLeilighet}
      </div>
      <div>
        {postboks} {postnummer} {poststed}
      </div>
      <div>
        {region} {landkode}
      </div>
    </address>
  );
}

export default StrukturertAdresse;
