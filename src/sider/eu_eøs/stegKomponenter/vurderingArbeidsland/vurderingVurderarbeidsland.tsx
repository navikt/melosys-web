import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Mui from "../../../../felleskomponenter/ui";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../../felleskomponenter/stegvelger";
import SokkelSkipListe from "../../../../felleskomponenter/sokkelskipliste";
import { formSelectors } from "../../../../ducks/form";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import MKV from "../../../../melosyskodeverk";
import "./vurderingVurderarbeidsland.css";
import Redigerbarliste from "./redigerbarliste";
import IngenSokkelSkipEllerHjemmebaser from "./ingenSokkelSkipEllerHjemmebaser";
import { KTObject } from "@navikt/melosys-kodeverk";
import { Avklartfakta } from "../../../../services/modules/avklartefakta";

interface VurderingVurderarbeidslandProps {
  begrunnelser: KTObject[];
  bekreftOgFortsett: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  tilstand: {
    harAvklaring: boolean;
    sokkelEllerSkipListe: Avklartfakta[];
    installasjonArbeidslandListe: Avklartfakta[];
    installasjonArbeidslandTypeListe: Avklartfakta[];
    arbeidslandListe: Avklartfakta[];
    arbeidUtforesIOppgittLandFakta: Avklartfakta;
    soknadslandFaktaListe: Avklartfakta[];
    harIngenMaritimeArbeidEllerHjemmebaser: boolean;
    arbeidslandFaktaListe: Avklartfakta[];
  };
}

export function VurderingVurderarbeidsland({
  bekreftOgFortsett,
  tilbake,
  tilstand: {
    harAvklaring,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    installasjonArbeidslandTypeListe,
    arbeidslandListe,
    arbeidUtforesIOppgittLandFakta,
    soknadslandFaktaListe,
    harIngenMaritimeArbeidEllerHjemmebaser,
    arbeidslandFaktaListe,
  },
  redigerbart,
  oppdaterData,
  slettData,
  begrunnelser,
}: VurderingVurderarbeidslandProps) {
  const [initialized, setInitialized] = useState(false);
  const maritimtArbeid = useSelector(formSelectors.MaritimtArbeidSelector);
  const hjemmebaser = useSelector(mottatteOpplysningerSelectors.HjemmebaserSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandSelector);
  const fjernedeArbeidsland = useSelector(avklartefaktaSelectors.IkkeArbeidslandSoknadslandSelector);

  useEffect(() => {
    soknadslandFaktaListe.forEach((fakta) => {
      oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.SOKNADSLAND, fakta));
    });
    arbeidslandFaktaListe.forEach((fakta) => {
      oppdaterData(konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, fakta));
    });

    setInitialized(true);

    return () => {
      slettData();
    };
  }, []);

  useEffect(() => {
    if (initialized) {
      slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND));

      arbeidsland
        .filter((land: string) => land)
        .forEach((land: string) => {
          oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, land, land, null));
        });
    }
  }, [arbeidsland.toString(), initialized]);

  const fjernSoknadsland = (land: string) => {
    oppdaterData(
      lagAvklartfakta(
        KV.Koder.avklartefaktaKoder.SOKNADSLAND,
        land,
        KV.Koder.SoknadslandFaktaTyper.IKKE_ARBEIDSLAND,
        null,
      ),
    );
  };

  const angreFjernSoknadsland = (land: string) => {
    slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, land));
  };

  const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(
    maritimtArbeid,
    (enkeltMaritimtArbeid) => enkeltMaritimtArbeid.enhetNavn,
  );

  const avklartefaktaEndret = (type: string, subjektID: string, verdi: string) => {
    oppdaterData(lagAvklartfakta(type, subjektID, verdi, null));
  };

  const avklartefaktaBegrunnelseEndret = (type: string, subjektID: string, verdi: string) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, [verdi]));
  };

  const innhold = harIngenMaritimeArbeidEllerHjemmebaser ? (
    <IngenSokkelSkipEllerHjemmebaser
      oppdaterData={oppdaterData}
      slettData={slettData}
      redigerbart={redigerbart}
      arbeidUtforesIOppgittLandFakta={arbeidUtforesIOppgittLandFakta}
    />
  ) : (
    <>
      {maritimtArbeid.length > 0 && (
        <>
          <Nav.BodyLong weight="semibold" size="small" className="undertittel">
            Vurdering sokkel/skip
          </Nav.BodyLong>
          <SokkelSkipListe
            className="borderBottom"
            sokkelEllerSkipListe={sokkelEllerSkipListe}
            installasjonArbeidslandListe={installasjonArbeidslandListe}
            installasjonArbeidslandTypeListe={installasjonArbeidslandTypeListe}
            arbeidslandListe={arbeidslandListe}
            maritimtArbeid={maritimtArbeid}
            begrunnelser={begrunnelser}
            redigerbart={redigerbart && harMaritimeArbeidUnikeNavn}
            avklartefaktaEndretHandler={avklartefaktaEndret}
            avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelseEndret}
            oppdaterData={oppdaterData}
            slettData={slettData}
          />
        </>
      )}
      {hjemmebaser.length > 0 && (
        <Nav.Row className="borderBottom">
          <Nav.Column xs="6">
            <Nav.BodyLong weight="semibold" size="small" className="undertittel">
              Hjemmebaser
            </Nav.BodyLong>
            <Redigerbarliste
              elementer={hjemmebaser.map((base: string) => ({
                kode: base,
                term: `${KV.kodeTilTerm(base, MKV.KTObjects.landkoder)} (${base})`,
                fjernbar: false,
              }))}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.BodyLong weight="semibold" size="small" className="undertittel">
            Land fra inngangsvilkår
          </Nav.BodyLong>
          <Redigerbarliste
            elementer={soknadsland.map((kode: string) => ({
              kode,
              term: `${KV.kodeTilTerm(kode, MKV.KTObjects.landkoder)} (${kode})`,
              defaultFjernet: fjernedeArbeidsland.includes(kode),
            }))}
            onFjern={fjernSoknadsland}
            onAngreFjern={angreFjernSoknadsland}
            redigerbar={redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
    </>
  );

  return (
    <div className="vurderingVurderArbeidsland">
      <Nav.Heading level="1" className="stegvelgertittel overskrift">
        Vurder arbeidsland
      </Nav.Heading>
      {innhold}
      <Mui.StegKnapper
        bekreftKnappProps={{ disabled: !(redigerbart && harAvklaring), onClick: bekreftOgFortsett }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

export default VurderingVurderarbeidsland;
