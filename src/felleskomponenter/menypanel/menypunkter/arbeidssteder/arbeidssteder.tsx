import React, { ReactNode } from "react";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Nav from "../../../../utils/navFrontend";
import * as Etiketter from "../../etiketter";
import * as Enkel from "./enkel";

import EditerbartElementListe from "../editerbartElementListe";

import "./arbeidssteder.css";

type FlattArbeidssted = KV.Form.ArbeidsstedFly | KV.Form.ArbeidsstedOffshore | KV.Form.ArbeidsstedSkip;

const flattArbeidsstedErIkkeTomt = (arbeidssted: FlattArbeidssted) =>
  Object.values(arbeidssted).some((v) => !Utils._isNil(v) && v !== "");

const ArbeidsstedUtlandErIkkeTomt = (arbeidssted: KV.Form.ArbeidsstedUtland) =>
  [arbeidssted.arbeidUtlandHjemmekontor, arbeidssted.foretakNavn, arbeidssted.foretakOrgnr].some(
    (v) => !Utils._isNil(v) && v !== ""
  ) || !Utils.adresse.erStrukturertAdresseObjektTomt(arbeidssted.adresse);

const hentLeggTilTekst = (tekstVedTomListe: string) => (elementer: any[]) =>
  elementer.length === 0 ? tekstVedTomListe : "Legg til ny seksjon";

const arbeidUtlandDefaultElement = {
  adresse: {
    gatenavn: "",
    husnummer: "",
    landkode: "",
    postnummer: "",
    poststed: "",
    region: "",
  },
  foretakNavn: "",
  foretakOrgnr: "",
  arbeidUtlandHjemmekontor: null,
};

interface ArbeidsstederProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  behandlingsgrunnlagEtikett: ReactNode;
}

const Arbeidssteder = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  behandlingsgrunnlagEtikett,
}: ArbeidsstederProps) => (
  <div className="arbeidssteder">
    <div>
      <Nav.typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
        {KV.Menypunkter.Arbeidssteder.tittel}
      </Nav.typo.Innholdstittel>
      <span>{behandlingsgrunnlagEtikett}</span>
      {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
    </div>
    <EditerbartElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidUtland"
      redigererKomponent={Enkel.Land.Redigerer}
      redigeringUtfortKomponent={Enkel.Land.RedigeringUtfort}
      leggTilTekst={hentLeggTilTekst("Legg til arbeidssted på land")}
      hentDefaultElement={() => arbeidUtlandDefaultElement}
      tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedLand}
      tittelIkon={Ikoner.Kontor}
      tittelUnderstrek
      elementUnderstrek
      harData={(elementListe) => elementListe.length !== 0 && elementListe.every(ArbeidsstedUtlandErIkkeTomt)}
      flereRedigeringsknapper={false}
    />
    <EditerbartElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedOffshore"
      redigererKomponent={Enkel.Offshore.Redigerer}
      redigeringUtfortKomponent={Enkel.Offshore.RedigeringUtfort}
      leggTilTekst={hentLeggTilTekst("Legg til arbeidssted offshore")}
      hentDefaultElement={() => ({})}
      tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedOffshore}
      tittelIkon={Ikoner.Helikopter}
      tittelUnderstrek
      elementUnderstrek
      harData={(elementListe) => elementListe.length !== 0 && elementListe.every(flattArbeidsstedErIkkeTomt)}
      flereRedigeringsknapper={false}
    />
    <EditerbartElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedSkip"
      redigererKomponent={Enkel.Skip.Redigerer}
      redigeringUtfortKomponent={Enkel.Skip.RedigeringUtfort}
      leggTilTekst={hentLeggTilTekst("Legg til arbeidssted på skip")}
      hentDefaultElement={() => ({})}
      tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedSkip}
      tittelIkon={Ikoner.Skip}
      tittelUnderstrek
      elementUnderstrek
      harData={(elementListe) => elementListe.length !== 0 && elementListe.every(flattArbeidsstedErIkkeTomt)}
      flereRedigeringsknapper={false}
    />
    <EditerbartElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedFly"
      redigererKomponent={Enkel.Fly.Redigerer}
      redigeringUtfortKomponent={Enkel.Fly.RedigeringUtfort}
      leggTilTekst={hentLeggTilTekst("Legg til arbeidssted på fly")}
      hentDefaultElement={() => ({})}
      tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedFly}
      tittelIkon={Ikoner.Fly}
      tittelUnderstrek
      elementUnderstrek
      harData={(elementListe) => elementListe.length !== 0 && elementListe.every(flattArbeidsstedErIkkeTomt)}
      flereRedigeringsknapper={false}
    />
  </div>
);

export default Arbeidssteder;
