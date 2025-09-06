import { useState } from "react";
import { PersonTallShortIcon } from "@navikt/aksel-icons";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Ikoner from "../../../../resources/images";
import * as Tags from "../../tags";
import * as MedfolgendeFamilie from "./medfolgendeFamilie";

import MKV from "../../../../melosyskodeverk";
import Familiemedlemmer from "./familiemedlemmer";
import EditerbartElementListe from "../editerbartElementListe";

import "./familieforholdContainer.less";
import { visAldriBinSymbolsynlighet } from "../editerbartElement/editerbartElement";
import VisFamilieMedlemmerFraRegisterKnapp from "./familiemedlemmer/visFamilieMedlemmerFraRegisterKnapp";

const { YRKESAKTIV } = MKV.Koder.behandlinger.behandlingstema;

interface FamilieforholdContainerProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  visMottatteOpplysningerData: boolean;
  behandlingstema: string;
}

function FamilieforholdContainer({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  visMottatteOpplysningerData,
  behandlingstema,
}: FamilieforholdContainerProps) {
  const [visFamilieforholdFraRegister, setVisFamilieforholdFraRegister] = useState(false);
  const sjekkAtMedfolgendeFamiliemedlemmerHarFnrOgNavn = (familiemedlemmer: KV.Form.MedfolgendeFamilie[]) =>
    familiemedlemmer.every((familiemedlem) => familiemedlem.fnr && familiemedlem.navn);

  return (
    <Nav.Container fluid className="familieforhold-container">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Heading level="2">{KV.Menypunkter.Familieforhold.tittel}</Nav.Heading>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="familiemedlemmer-row">
        <Nav.Column xs="12">
          {visFamilieforholdFraRegister ? (
            <Familiemedlemmer />
          ) : (
            <VisFamilieMedlemmerFraRegisterKnapp onClick={setVisFamilieforholdFraRegister} />
          )}
        </Nav.Column>
      </Nav.Row>
      {visMottatteOpplysningerData && (
        <>
          <Nav.Row>
            <Nav.Column xs="12" className="etikett-container">
              <Tags.FraBruker />
              {visArbeidsforholdRolleEtiketter && <Tags.BrukersDel style={{ marginLeft: "0.3em" }} />}
            </Nav.Column>
          </Nav.Row>
          {behandlingstema === YRKESAKTIV ? (
            <div>
              <Nav.Heading level="3" className="familieforhold-container__understrek">
                <PersonTallShortIcon
                  aria-hidden="true"
                  fontSize="1.5rem"
                  className="familieforhold-container__mellomrom_ikon_tekst"
                />
                {KV.Menypunkter.Familieforhold.undertitler.familieMedPaReisen}
              </Nav.Heading>
              <Nav.Row>
                <Nav.Column xs="12" className="familiemedpareisen">
                  <EditerbartElementListe
                    redigerbart={redigerbart}
                    feltNavn="medfolgendeBarn"
                    redigererKomponent={MedfolgendeFamilie.Redigerer}
                    redigeringUtfortKomponent={MedfolgendeFamilie.RedigeringUtfort}
                    ingenDataKomponent={() => <div className="ingen-data" />}
                    leggTilTekst={(elementer) => (elementer.length > 0 ? "Legg til nytt barn" : "Legg til barn")}
                    hentDefaultElement={() => ({ uuid: Utils._uuid() })}
                    tittelTekst="Barn"
                    tittelUnderstrek={false}
                    symbolsynlighet={visAldriBinSymbolsynlighet}
                    harData={(elementListe) => elementListe.length !== 0 && elementListe.every((v) => v)}
                    flereRedigeringsknapper={false}
                    onLagreClick={sjekkAtMedfolgendeFamiliemedlemmerHarFnrOgNavn}
                  />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column xs="12" className="familiemedpareisen">
                  <EditerbartElementListe
                    redigerbart={redigerbart}
                    feltNavn="medfolgendeEktefelleSamboer"
                    redigererKomponent={MedfolgendeFamilie.Redigerer}
                    redigeringUtfortKomponent={MedfolgendeFamilie.RedigeringUtfort}
                    ingenDataKomponent={() => <div className="ingen-data" />}
                    leggTilTekst="Legg til ektefelle/partner/samboer"
                    hentDefaultElement={() => ({ uuid: Utils._uuid() })}
                    tittelTekst="Ektefelle/partner/samboer"
                    tittelUnderstrek={false}
                    harData={(elementListe) => elementListe.length !== 0 && elementListe.every((v) => v)}
                    maksAntallElementer={1}
                    flereRedigeringsknapper={false}
                    onLagreClick={sjekkAtMedfolgendeFamiliemedlemmerHarFnrOgNavn}
                  />
                </Nav.Column>
              </Nav.Row>
            </div>
          ) : (
            <Nav.Row>
              <Nav.Column xs="12">
                <EditerbartElementListe
                  redigerbart={redigerbart}
                  feltNavn="medfolgendeBarn"
                  redigererKomponent={MedfolgendeFamilie.Redigerer}
                  redigeringUtfortKomponent={MedfolgendeFamilie.RedigeringUtfort}
                  ingenDataKomponent={MedfolgendeFamilie.IngenData}
                  leggTilTekst={(elementer) => (elementer.length > 0 ? "Legg til nytt barn" : "Legg til barn")}
                  hentDefaultElement={() => ({ uuid: Utils._uuid() })}
                  tittelTekst={KV.Menypunkter.Familieforhold.undertitler.barnMedPaReisen}
                  tittelIkon={Ikoner.ParentAndKid}
                  tittelUnderstrek
                  harData={(elementListe) => elementListe.length !== 0 && elementListe.every((v) => v)}
                  flereRedigeringsknapper={false}
                  onLagreClick={sjekkAtMedfolgendeFamiliemedlemmerHarFnrOgNavn}
                />
              </Nav.Column>
            </Nav.Row>
          )}
        </>
      )}
    </Nav.Container>
  );
}

export default FamilieforholdContainer;
