import React, { Fragment } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../../melosyskodeverk";
import * as KV from "../../../../../../kodeverk";
import * as Nav from "../../../../../../navFrontend";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import { BOOLSK_STRING } from "../../../../../../constants";
import { VilkarOgBegrunnelser } from "../vurderingBestemmelse";
import { FlytFinnesIkke } from "./flytFinnesIkke";

const SAERLIG_GRUNN = "SAERLIG_GRUNN";
const hjelpetekster = new Map([
  [
    SAERLIG_GRUNN,
    "Nedtrekksmenyen inneholder grupper av personer som kan tas opp etter en rimelighetsvurdering i tilfeller der en søknad om medlemskap vurderes etter § 2-8 andre ledd.",
  ],
  [
    MKV.Koder.vilkaar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
    "Husk at perioder med trygdetid fra andre EØS-land sidestilles med norsk trygdetid.",
  ],
]);

interface VilkaarOgBegrunnelserProps {
  vilkaarOgBegrunnelser: VilkarOgBegrunnelser;
  valgteVilkar: any;
  vilkaarKodeverk: KTObject[];
  handleEndreVilkar: (vilkar: any) => void;
  redigerbart: boolean;
  handleEndreBegrunnelse: (begrunnelse: any) => void;
  begrunnelserKodeverk: { [key: string]: KTObject[] };
  valgteBegrunnelser: any;
}

export const VilkaarOgBegrunnelser = ({
  vilkaarOgBegrunnelser: { vilkaar, muligeBegrunnelser },
  valgteVilkar,
  valgteBegrunnelser,
  vilkaarKodeverk,
  handleEndreVilkar,
  redigerbart,
  handleEndreBegrunnelse,
  begrunnelserKodeverk,
}: VilkaarOgBegrunnelserProps) => {
  const hjelpetekstForVilkaar = hjelpetekster.get(vilkaar);
  const valgteVilkarForVilkaar = valgteVilkar.get(`${vilkaar}`);

  return (
    <Fragment>
      <Nav.Fieldset
        className="radio"
        legend={
          <LabelMedHjelpetekst
            label={KV.finnTermFraListe(vilkaarKodeverk, vilkaar)}
            hjelpetekst={hjelpetekstForVilkaar}
          />
        }
      >
        <Nav.Row>
          <Nav.Column xs="1">
            <Nav.Radio
              label="Ja"
              name={vilkaar}
              onChange={handleEndreVilkar}
              checked={valgteVilkarForVilkaar === BOOLSK_STRING.SANN}
              value={BOOLSK_STRING.SANN}
              key={BOOLSK_STRING.SANN}
              disabled={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column xs="1">
            <Nav.Radio
              label="Nei"
              name={vilkaar}
              onChange={handleEndreVilkar}
              checked={valgteVilkarForVilkaar === BOOLSK_STRING.USANN}
              value={BOOLSK_STRING.USANN}
              key={BOOLSK_STRING.USANN}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {valgteVilkarForVilkaar === BOOLSK_STRING.USANN && (
        <div className="flytFinnesIkke">
          <FlytFinnesIkke />
        </div>
      )}
      {muligeBegrunnelser.length > 0 && valgteVilkarForVilkaar === BOOLSK_STRING.SANN && (
        <Nav.Fieldset
          className="select"
          legend={<LabelMedHjelpetekst label="Velg særlig grunn" hjelpetekst={hjelpetekster.get(SAERLIG_GRUNN)} />}
        >
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                label=""
                bredde="fullbredde"
                onChange={handleEndreBegrunnelse}
                name={`${vilkaar}_begrunnelser`}
                value={valgteBegrunnelser.get(`${vilkaar}_begrunnelser`)}
                disabled={!redigerbart}
              >
                <option key="" value="" disabled={!!valgteBegrunnelser.get(`${vilkaar}_begrunnelser`)}>
                  Velg
                </option>
                {muligeBegrunnelser.map((begrunnelse: any) => (
                  <option key={begrunnelse} value={begrunnelse}>
                    {KV.termFraNestedKTObject(begrunnelserKodeverk, begrunnelse)}
                  </option>
                ))}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      )}
    </Fragment>
  );
};
