import { change } from "redux-form";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";

import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Ikoner from "../../../../resources/images";
import * as Nav from "../../../../navFrontend";
import * as Tags from "../../tags";
import * as Fly from "./fly";
import * as Land from "./land";
import * as Offshore from "./offshore";
import * as Skip from "./skip";

import EditerbartElementListe from "../editerbartElementListe";
import RepresentantIUtlandet from "./representantIUtlandet";
import { Status } from "../editerbartElement";

import MKV, { MKVUtils } from "../../../../melosyskodeverk";

import { formSelectors } from "../../../../ducks/form";

import "./arbeidssteder.less";

const { YRKESAKTIV } = MKV.Koder.behandlinger.behandlingstema;

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
    tilleggsnavn: "",
    gatenavn: "",
    husnummerEtasjeLeilighet: "",
    landkode: "",
    postboks: "",
    postnummer: "",
    poststed: "",
    region: "",
  },
  virksomhetNavn: "",
};

interface ArbeidsstederProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  behandlingstema: string;
}

function Arbeidssteder({ redigerbart, visArbeidsforholdRolleEtiketter, behandlingstema }: ArbeidsstederProps) {
  const dispatch = useDispatch();
  const slettFastArbeidsstedOgHjemmekontorAvklaring = () => {
    dispatch(change(KV.Form.SOKNAD, "arbeidPaaLand.erFastArbeidssted", null));
    dispatch(change(KV.Form.SOKNAD, "arbeidPaaLand.erHjemmekontor", null));
  };
  const soknadsform = useSelector(formSelectors.SoknadFormValuesSelector) as KV.Form.SoknadFormData;

  const visArbeidsstedPaaLandSporsmal = MKVUtils.erUtsendt(behandlingstema);
  const flereLandUkjentHvilke = soknadsform?.soknadsland?.flereLandUkjentHvilke;
  const erHjemmekontor = soknadsform?.arbeidPaaLand?.erHjemmekontor;
  const erFastArbeidssted = soknadsform?.arbeidPaaLand?.erFastArbeidssted;
  const visRepresentantIUtlandet = behandlingstema === YRKESAKTIV;

  const arbeidsstederLister = (
    <>
      <EditerbartElementListe
        redigerbart={redigerbart}
        feltNavn="arbeidPaaLand.fysiskeArbeidssteder"
        redigererPreElementerKomponent={visArbeidsstedPaaLandSporsmal ? Land.RedigererPreElementer : undefined}
        redigeringUtfortPreElementerKomponent={
          visArbeidsstedPaaLandSporsmal ? Land.RedigeringUtfortPreElementer : undefined
        }
        redigererKomponent={Land.Redigerer}
        redigeringUtfortKomponent={Land.RedigeringUtfort}
        ingenDataKomponent={visArbeidsstedPaaLandSporsmal ? Land.IngenData : undefined}
        leggTilTekst="Legg til nytt arbeidssted på land"
        hentDefaultElement={() => fysiskArbeidsstedDefaultElement}
        tittelTekst={KV.Menypunkter.Arbeidssteder.undertitler.arbeidsstedLand}
        tittelIkon={Ikoner.Kontor}
        tittelUnderstrek
        elementUnderstrek
        harData={(elementListe) =>
          [erFastArbeidssted, erHjemmekontor].some((v) => !Utils._isNil(v)) ||
          (elementListe.length !== 0 && elementListe.every(fysiskArbeidsstedErIkkeTomt))
        }
        flereRedigeringsknapper={false}
        onBinClick={slettFastArbeidsstedOgHjemmekontorAvklaring}
        symbolsynlighet={{ [Status.IngenData]: { pencil: true, bin: false } }}
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
    </>
  );

  const flereLandUkjentHvilkeValgtAlert = (
    <Nav.Alert variant="info">
      Ikke mulig å legge til arbeidssted(er) når det ikke er oppgitt land. Du kan endre dette under sidemenypunkt
      “Periode og land”.
    </Nav.Alert>
  );

  const arbeidssteder = flereLandUkjentHvilke ? flereLandUkjentHvilkeValgtAlert : arbeidsstederLister;

  return (
    <div className="arbeidssteder">
      <Nav.Heading level="2" style={{ display: "inline", marginRight: "1em" }}>
        {KV.Menypunkter.Arbeidssteder.tittel}
      </Nav.Heading>
      {visArbeidsforholdRolleEtiketter && <Tags.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      <div className="innhold">
        {visRepresentantIUtlandet ? <RepresentantIUtlandet redigerbart={redigerbart} /> : arbeidssteder}
      </div>
    </div>
  );
}

export default Arbeidssteder;
