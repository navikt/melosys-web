import React, { ReactNode } from "react";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";
import * as Etiketter from "../../etiketter";
import * as MedfolgendeFamilie from "./medfolgendeFamilie";

import Familiemedlemmer from "./familiemedlemmer";
import FamiliemedlemmerFraPDL from "./familiemedlemmerFraPDL";
import EditerbartElementListe from "../editerbartElementListe";
import { useFeatureToggle } from "../../../../featuretoggle";

import "./familieforholdContainer.css";

interface FamilieforholdContainerProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  behandlingsgrunnlagEtikett: ReactNode;
  visBehandlingsgrunnlagData: boolean;
  setMenypanelFeilmelding: (feilmelding: string) => void;
  visEktefelleSamboerMedPaReisen: boolean;
}

const FamilieforholdContainer = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  behandlingsgrunnlagEtikett,
  visBehandlingsgrunnlagData,
  setMenypanelFeilmelding,
  visEktefelleSamboerMedPaReisen,
}: FamilieforholdContainerProps) => {
  const [familiemedlemmerFraPDLToggle] = useFeatureToggle("melosys.hent-familiemedlemmer-fra-pdl");

  const sjekkAtMedfolgendeFamiliemedlemmerHarFnrOgNavn = (familiemedlemmer: KV.Form.MedfolgendeFamilie[]) =>
    familiemedlemmer.every((familiemedlem) => familiemedlem.fnr && familiemedlem.navn);

  return (
    <Nav.Container fluid className="familieforhold-container">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
            {KV.Menypunkter.Familieforhold.tittel}
          </Nav.Typo.Innholdstittel>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="familiemedlemmer-row">
        <Nav.Column xs="12">
          {familiemedlemmerFraPDLToggle === "enabled" && <FamiliemedlemmerFraPDL />}
          {familiemedlemmerFraPDLToggle === "disabled" && (
            <Familiemedlemmer setMenypanelFeilmelding={setMenypanelFeilmelding} />
          )}
        </Nav.Column>
      </Nav.Row>
      {visBehandlingsgrunnlagData && (
        <>
          <Nav.Row>
            <Nav.Column xs="12" className="etikett-container">
              <span>{behandlingsgrunnlagEtikett}</span>
              {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidstakersDel style={{ marginLeft: "0.3em" }} />}
            </Nav.Column>
          </Nav.Row>
          {visEktefelleSamboerMedPaReisen ? (
            <div>
              <Mui.Undertittel
                tekst={KV.Menypunkter.Familieforhold.undertitler.familieMedPaReisen}
                ikon={Ikoner.Familie}
                understrek
              />
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
};

export default FamilieforholdContainer;
