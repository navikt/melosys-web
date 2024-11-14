import * as Nav from "../../../../navFrontend";
import { Fullmektig, Type } from "./types";
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
                <Nav.Heading size="small" className="inline_felt">
                  {fullmektig.adresse?.mottakerNavn}
                </Nav.Heading>
              </div>
              <Nav.Row>
                <Nav.Column xs="6">
                  <Nav.BodyLong weight="semibold" size="small" className="inline_felt">
                    Org.nr.:{" "}
                  </Nav.BodyLong>
                  <Nav.BodyLong size="small" className="inline_felt">
                    {fullmektig.ident}
                  </Nav.BodyLong>
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
              <Nav.Heading size="small" className="inline_felt">
                {fullmektig.adresse?.mottakerNavn}
              </Nav.Heading>
            </div>
            <Nav.Row>
              <Nav.Column xs="6">
                <Nav.BodyLong weight="semibold" size="small" className="inline_felt">
                  F.nr./d-nr.:{" "}
                </Nav.BodyLong>
                <Nav.BodyLong size="small" className="inline_felt">
                  {fullmektig.ident}
                </Nav.BodyLong>
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
          <Nav.BodyLong weight="semibold" size="small" className="inline_felt">
            {KV.kodeTilTerm(fullmakt, MKV.KTObjects.fullmaktstype)}
          </Nav.BodyLong>
        </div>
      ))}
    </>
  );
};

const Kontaktperson = ({ fullmektig }: { fullmektig: Fullmektig }) => {
  if (!fullmaktStøtterKontaktperson(fullmektig.fullmakter)) return null;
  return (
    <div className="kontaktperson">
      <Nav.BodyLong weight="semibold" size="small">
        Kontaktopplysninger
      </Nav.BodyLong>
      {fullmektig.kontaktperson ? (
        <div>
          <Nav.BodyLong weight="semibold" size="small" className="inline_felt">
            Kontaktperson:{" "}
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className="inline_felt">
            {fullmektig.kontaktperson}
          </Nav.BodyLong>
        </div>
      ) : (
        <Nav.BodyLong size="small">Ingen registrert</Nav.BodyLong>
      )}
      {fullmektig.kontaktTelefon && (
        <div>
          <Nav.BodyLong weight="semibold" size="small" className="inline_felt">
            Telefon:{" "}
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className="inline_felt">
            {fullmektig.kontaktTelefon}
          </Nav.BodyLong>
        </div>
      )}
      {fullmektig.kontaktOrgnr && (
        <div>
          <Nav.BodyLong weight="semibold" size="small" className="inline_felt">
            Org.nr.:{" "}
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className="inline_felt">
            {fullmektig.kontaktOrgnr}
          </Nav.BodyLong>
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
