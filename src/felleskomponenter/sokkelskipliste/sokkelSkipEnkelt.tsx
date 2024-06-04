import { ChangeEvent, useEffect } from "react";
import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";
import { konverterAvklartfaktaTilStegData, slettAvklartfakta } from "../stegvelger";
import { hentFaktaVerdi } from "../../domeneUtils";
import "./sokkelSkipEnkelt.css";
import ArbeidslandRadioButtons, { ArbeidslandProp } from "./arbeidslandRadioButtons";
import { KTObject } from "@navikt/melosys-kodeverk";
import { Avklartfakta } from "../../services/modules/avklartefakta";
import { ArbeidsstedOffshore, ArbeidsstedSkip } from "../../kodeverk/form";

const { ARBEIDSLAND } = MKV.Koder.avklartefaktatyper;
const { SOKKEL_ELLER_SKIP } = KV.Koder.avklartefaktaKoder;
const { INSTALLASJON_ARBEIDSLAND, INSTALLASJON_ARBEIDSLAND_TYPE } = KV.Koder.referanseKoder;

interface SokkelSkipEnkeltProps {
  maritimtArbeid: ArbeidsstedOffshore | ArbeidsstedSkip;
  sokkelEllerSkip?: Avklartfakta;
  arbeidslandAvklartfakta?: Avklartfakta;
  arbeidslandTypeAvklartfakta?: Avklartfakta;
  arbeidslandFakta?: Avklartfakta;
  begrunnelser: KTObject[];
  redigerbart: boolean;
  avklartefaktaEndretHandler: (type: string, subjektID: string, verdi: string) => void;
  avklartefaktaBegrunnelserEndretHandler: (type: string, subjektID: string, verdi: string) => void;
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
}

const SokkelSkipEnkelt = ({
  maritimtArbeid,
  sokkelEllerSkip,
  arbeidslandAvklartfakta,
  arbeidslandTypeAvklartfakta,
  arbeidslandFakta,
  begrunnelser,
  redigerbart,
  avklartefaktaEndretHandler,
  avklartefaktaBegrunnelserEndretHandler,
  oppdaterData,
  slettData,
}: SokkelSkipEnkeltProps) => {
  const begrunnelseKode = sokkelEllerSkip?.begrunnelseKoder?.[0];
  const installasjonsType = hentFaktaVerdi(sokkelEllerSkip);
  const arbeidslandType = hentFaktaVerdi(arbeidslandTypeAvklartfakta);
  const arbeidsland = arbeidslandFakta?.subjektID;
  const { SOKKEL, SKIP } = KV.Koder;

  const key = `${SOKKEL_ELLER_SKIP}${maritimtArbeid.enhetNavn}`;

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(SOKKEL_ELLER_SKIP, sokkelEllerSkip));
    oppdaterData(konverterAvklartfaktaTilStegData(INSTALLASJON_ARBEIDSLAND, arbeidslandAvklartfakta));
    oppdaterData(konverterAvklartfaktaTilStegData(ARBEIDSLAND, arbeidslandFakta));
    oppdaterData(konverterAvklartfaktaTilStegData(INSTALLASJON_ARBEIDSLAND_TYPE, arbeidslandTypeAvklartfakta));

    return () => {
      slettData(slettAvklartfakta(SOKKEL_ELLER_SKIP, maritimtArbeid.enhetNavn));
      slettData(slettAvklartfakta(INSTALLASJON_ARBEIDSLAND, maritimtArbeid.enhetNavn));
      slettData(slettAvklartfakta(ARBEIDSLAND, arbeidsland));
      slettData(slettAvklartfakta(INSTALLASJON_ARBEIDSLAND_TYPE, maritimtArbeid.enhetNavn));
    };
  }, []);

  const sokkelSkipEndret = (value: string) =>
    avklartefaktaEndretHandler(SOKKEL_ELLER_SKIP, maritimtArbeid.enhetNavn!!, value);

  const begrunnelserEndret = (event: ChangeEvent<HTMLSelectElement>) =>
    avklartefaktaBegrunnelserEndretHandler(SOKKEL_ELLER_SKIP, maritimtArbeid.enhetNavn!!, event.target.value);

  const arbeidslandEndret = (land: ArbeidslandProp) => {
    avklartefaktaEndretHandler(INSTALLASJON_ARBEIDSLAND, maritimtArbeid.enhetNavn!!, land.landkode!!);
    avklartefaktaEndretHandler(ARBEIDSLAND, land.landkode!!, land.landkode!!);
    avklartefaktaEndretHandler(INSTALLASJON_ARBEIDSLAND_TYPE, maritimtArbeid.enhetNavn!!, land.type);
  };

  const sokkelSkipDisabled = !(redigerbart && maritimtArbeid.enhetNavn);

  return (
    <Nav.Row className="sokkelSkip__liste__rad">
      <Nav.Column xs="3">{maritimtArbeid.enhetNavn}</Nav.Column>
      <Nav.Column xs="2">
        <Nav.RadioGroup
          legend=""
          hideLegend
          onChange={sokkelSkipEndret}
          disabled={sokkelSkipDisabled}
          defaultValue={installasjonsType}
          name={key}
          size="small"
        >
          <Nav.Radio value={SOKKEL} id={Utils._uuid()}>
            Sokkel
          </Nav.Radio>
          <Nav.Radio value={SKIP} id={Utils._uuid()}>
            Skip
          </Nav.Radio>
        </Nav.RadioGroup>
      </Nav.Column>
      {installasjonsType === SOKKEL && (
        <Nav.Column xs="3">
          <Nav.Select
            name={`${key}_begrunnelser`}
            disabled={sokkelSkipDisabled}
            id="installasjonsTypeBegrunnelser"
            label="Begrunnelse hvis sokkel"
            onChange={begrunnelserEndret}
            value={begrunnelseKode}
          >
            <option key="" value="" label="Velg begrunnelse" disabled={!!begrunnelseKode} />
            {begrunnelser.map((enkelt) => (
              <option key={enkelt.kode} value={enkelt.kode} label={enkelt.term ?? ""} />
            ))}
          </Nav.Select>
        </Nav.Column>
      )}
      <Nav.Column xs="4">
        <Nav.Typo.Element className="arbeidsland_label">Velg arbeidsland</Nav.Typo.Element>
        <ArbeidslandRadioButtons
          landliste={[
            {
              type: "Flaggland",
              landkode: "flaggLandkode" in maritimtArbeid ? maritimtArbeid.flaggLandkode : undefined,
            },
            {
              type: "Sokkelland",
              landkode: "innretningLandkode" in maritimtArbeid ? maritimtArbeid?.innretningLandkode : undefined,
            },
            {
              type: "Territorialfarvannsland",
              landkode: "territorialfarvann" in maritimtArbeid ? maritimtArbeid?.territorialfarvann : undefined,
            },
          ]}
          onChange={arbeidslandEndret}
          arbeidslandType={arbeidslandType}
          disabled={sokkelSkipDisabled}
        />
      </Nav.Column>
    </Nav.Row>
  );
};

export default SokkelSkipEnkelt;
