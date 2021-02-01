import React, { ReactNode } from "react";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Nav from "../../../../utils/navFrontend";
import * as Etiketter from "../../etiketter";
import * as Fly from "./fly";
import * as Land from "./land";
import * as Offshore from "./offshore";
import * as Skip from "./skip";

import EditerbartElementListe from "../editerbartElementListe";

import "./arbeidssteder.css";

type FlattArbeidssted = KV.Form.ArbeidsstedFly | KV.Form.ArbeidsstedOffshore | KV.Form.ArbeidsstedSkip;

const flattArbeidsstedErIkkeTomt = (arbeidssted: FlattArbeidssted) =>
  Object.values(arbeidssted).some((v) => !Utils._isNil(v) && v !== "");

const fysiskArbeidsstedErIkkeTomt = (fysiskArbeidssted: KV.Form.FysiskArbeidssted) =>
  !(
    (Utils._isNil(fysiskArbeidssted.virksomhetNavn) || fysiskArbeidssted.virksomhetNavn === "") &&
    Utils.adresse.erStrukturertAdresseObjektTomt(fysiskArbeidssted.adresse)
  );

const fysiskArbeidsstedDefaultElement: KV.Form.FysiskArbeidssted = {
  adresse: {
    gatenavn: "",
    husnummer: "",
    landkode: "",
    postnummer: "",
    poststed: "",
    region: "",
  },
  virksomhetNavn: "",
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
      feltNavn="arbeidPaaLand.fysiskeArbeidssteder"
      redigererKomponent={Land.Redigerer}
      redigeringUtfortKomponent={Land.RedigeringUtfort}
      leggTilTekst="Legg til nytt arbeidssted på land"
      hentDefaultElement={() => fysiskArbeidsstedDefaultElement}
      tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedLand}
      tittelIkon={Ikoner.Kontor}
      tittelUnderstrek
      elementUnderstrek
      harData={(elementListe) => elementListe.length !== 0 && elementListe.every(fysiskArbeidsstedErIkkeTomt)}
      flereRedigeringsknapper={false}
    />
    <EditerbartElementListe
      redigerbart={redigerbart}
      feltNavn="arbeidsstedOffshore"
      redigererKomponent={Offshore.Redigerer}
      redigeringUtfortKomponent={Offshore.RedigeringUtfort}
      leggTilTekst="Legg til nytt arbeidssted offshore"
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
      redigererKomponent={Skip.Redigerer}
      redigeringUtfortKomponent={Skip.RedigeringUtfort}
      leggTilTekst="Legg til nytt arbeidssted på skip"
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
      redigererKomponent={Fly.Redigerer}
      redigeringUtfortKomponent={Fly.RedigeringUtfort}
      leggTilTekst="Legg til nytt arbeidssted på fly"
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
