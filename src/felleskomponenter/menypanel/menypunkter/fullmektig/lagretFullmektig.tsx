import * as Nav from "../../../../navFrontend";
import { Fullmektig, Type } from "./types";
import * as Utils from "../../../../utils";
import * as Ikon from "../../../../resources/images";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import { fullmaktStøtterKontaktperson } from "./redigererFullmektig";
import BrevAdresse from "../../../adresser/brevAdresse";

interface LagretFullmektigProps {
  fullmektige: Fullmektig[];
}

const LagretFullmektig = ({ fullmektige }: LagretFullmektigProps) => {
  return (
    <>
      {fullmektige.map((fullmektig: Fullmektig) => {
        if (fullmektig.type === Type.ORGANISASJON) {
          return (
            <div className="lagretFullmektig_container" key={fullmektig.ident}>
              <div className="overskrift">
                <Ikon.Fullmakt className="inline_felt ikon" aria-hidden />
                <Nav.Typo.Systemtittel className="inline_felt">
                  {fullmektig.adresse?.mottakerNavn}
                </Nav.Typo.Systemtittel>
              </div>
              <Nav.Row>
                <Nav.Column xs="6">
                  <Nav.Typo.Element className="inline_felt">Org.nr.: </Nav.Typo.Element>
                  <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.ident}</Nav.Typo.Normaltekst>
                  {fullmektig.adresse && <BrevAdresse {...fullmektig.adresse} visNavn={false} />}
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
          <div className="lagretFullmektig_container" key={fullmektig.ident}>
            <div className="overskrift">
              <Ikon.Fullmakt className="inline_felt ikon" aria-hidden />
              <Nav.Typo.Systemtittel className="inline_felt">
                {Utils.person.tilSammensattNavnFraObjekt(fullmektig.adresse?.mottakerNavn)}
              </Nav.Typo.Systemtittel>
            </div>
            <Nav.Row>
              <Nav.Column xs="6">
                <Nav.Typo.Element className="inline_felt">F.nr./d-nr.: </Nav.Typo.Element>
                <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.ident}</Nav.Typo.Normaltekst>
                {fullmektig.adresse && <BrevAdresse {...fullmektig.adresse} visNavn={false} />}
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
        <div key={fullmakt}>
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
  if (!fullmaktStøtterKontaktperson(fullmektig.fullmakter)) return null;
  return (
    <div className="kontaktperson">
      <Nav.Typo.Element>Kontaktopplysninger</Nav.Typo.Element>
      {fullmektig.kontaktperson ? (
        <div>
          <Nav.Typo.Element className="inline_felt">Kontaktperson: </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="inline_felt">{fullmektig.kontaktperson}</Nav.Typo.Normaltekst>
        </div>
      ) : (
        <Nav.Typo.Normaltekst>Ingen registrert</Nav.Typo.Normaltekst>
      )}
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
      {fullmektig.kontaktOrgnr && fullmektig.kontaktOrgAdresse && (
        <>
          <BrevAdresse visNavn={false} {...fullmektig.kontaktOrgAdresse} />
          <Nav.Typo.EtikettLiten className="brev_sendes">(Brev sendes til denne adressen)</Nav.Typo.EtikettLiten>
        </>
      )}
    </div>
  );
};

export default LagretFullmektig;
