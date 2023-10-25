import * as Nav from "../../../../navFrontend";
import { Fullmektig, Type } from "./types";
import Adresse from "./adresse";
import * as Utils from "../../../../utils";
import * as Ikon from "../../../../resources/images";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

interface LagretFullmektigProps {
  fullmektige: Fullmektig[];
}

const LagretFullmektig = ({ fullmektige }: LagretFullmektigProps) => {
  return (
    <>
      {fullmektige.map((fullmektig: Fullmektig) => {
        if (fullmektig.type === Type.ORGANISASJON) {
          return (
            <div className="lagretFullmektig_container">
              <div className="overskrift">
                <Ikon.Fullmakt className="inline_felt ikon" aria-hidden />
                <Nav.Typo.Systemtittel className="inline_felt">{fullmektig.org?.navn}</Nav.Typo.Systemtittel>
              </div>
              <Nav.Row>
                <Nav.Column xs="6">
                  <Nav.Typo.Element className="inline_felt">Org.nr.: </Nav.Typo.Element>
                  <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.id}</Nav.Typo.Normaltekst>
                  <Adresse type={Type.ORGANISASJON} organisasjon={fullmektig.org} visNavn={false} />
                  <Kontaktperson fullmektig={fullmektig} />
                </Nav.Column>
                <Nav.Column xs="6">
                  <Fullmakter fullmakter={fullmektig.fullmakter} />
                </Nav.Column>
              </Nav.Row>
            </div>
          );
        }
        return (
          <div className="lagretFullmektig_container">
            <div className="overskrift">
              <Ikon.Fullmakt className="inline_felt ikon" aria-hidden />
              <Nav.Typo.Systemtittel className="inline_felt">
                {Utils.person.tilSammensattNavnFraObjekt(fullmektig.person?.navn)}
                {fullmektig.person?.bostedsadresser[0].coAdressenavn
                  ? ` C/O ${fullmektig.person.bostedsadresser[0].coAdressenavn}`
                  : ""}
              </Nav.Typo.Systemtittel>
            </div>
            <Nav.Row>
              <Nav.Column xs="6">
                <Nav.Typo.Element className="inline_felt">F.nr./d-nr.: </Nav.Typo.Element>
                <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.id}</Nav.Typo.Normaltekst>
                <Adresse type={Type.PERSON} person={fullmektig.person} visNavn={false} />
              </Nav.Column>
              <Nav.Column xs="6">
                <Fullmakter fullmakter={fullmektig.fullmakter} />
              </Nav.Column>
            </Nav.Row>
          </div>
        );
      })}
    </>
  );
};

const Fullmakter = ({ fullmakter }: { fullmakter: string[] }) => {
  return (
    <>
      {fullmakter.map((fullmakt) => (
        <div>
          <Ikon.GreenCheckmark className="inline_felt ikon" />
          <Nav.Typo.Element className="inline_felt">
            {KV.kodeTilTerm(fullmakt, MKV.KTObjects.fullmaktstype)}
          </Nav.Typo.Element>
        </div>
      ))}
    </>
  );
};

const Kontaktperson = ({ fullmektig }: { fullmektig: Fullmektig }) => {
  return (
    <div className="kontaktperson">
      <Nav.Typo.Element>Kontaktopplysninger</Nav.Typo.Element>
      <div>
        <Nav.Typo.Element className="inline_felt">Kontaktperson: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.kontaktperson ?? "-"}</Nav.Typo.Normaltekst>
      </div>
      {fullmektig.kontaktTelefon && (
        <div>
          <Nav.Typo.Element className="inline_felt">Telefon: </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.kontaktTelefon}</Nav.Typo.Normaltekst>
        </div>
      )}
      {fullmektig.kontaktOrgnr && (
        <div>
          <Nav.Typo.Element className="inline_felt">Org.nr.: </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.kontaktOrgnr}</Nav.Typo.Normaltekst>
        </div>
      )}
      {fullmektig.kontaktOrgnr && fullmektig.kontaktOrg && (
        <>
          <Adresse type={Type.ORGANISASJON} organisasjon={fullmektig.kontaktOrg} visNavn={false} />
          <Nav.Typo.EtikettLiten className="brev_sendes">(Brev sendes til denne adressen)</Nav.Typo.EtikettLiten>
        </>
      )}
    </div>
  );
};

export default LagretFullmektig;
