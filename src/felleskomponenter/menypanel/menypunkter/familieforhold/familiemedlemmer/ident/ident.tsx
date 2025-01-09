import KopierbarTekst from "../../../../../kopierbarTekst";

interface IdentProps {
  ident: string;
}

function Ident({ ident }: IdentProps) {
  return <KopierbarTekst hovertekst="Kopier fødselsnummer">{ident}</KopierbarTekst>;
}

export default Ident;
