import React, { ChangeEventHandler, Fragment } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../../melosyskodeverk";
import * as Api from "../../../../../../services/api";
import * as KV from "../../../../../../kodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import { BOOLSK_STRING } from "../../../../../../constants";
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
  vilkaarOgBegrunnelser: Api.Medlemskapsperioder.VilkårOgBegrunnelser;
  valgteVilkar: Map<string, string>;
  valgteBegrunnelser: Map<string, string>;
  vilkaarKodeverk: KTObject[];
  begrunnelserKodeverk: { [key: string]: KTObject[] };
  handleEndreVilkar: ChangeEventHandler<HTMLInputElement>;
  handleEndreBegrunnelse: ChangeEventHandler<HTMLSelectElement>;
  redigerbart: boolean;
}

export const VilkaarOgBegrunnelser = ({
  vilkaarOgBegrunnelser: { vilkaar, muligeBegrunnelser },
  valgteVilkar,
  valgteBegrunnelser,
  vilkaarKodeverk,
  begrunnelserKodeverk,
  handleEndreVilkar,
  handleEndreBegrunnelse,
  redigerbart,
}: VilkaarOgBegrunnelserProps) => {
  const hjelpetekstForVilkaar = hjelpetekster.get(vilkaar);
  const valgteVilkarForVilkaar = valgteVilkar.get(`${vilkaar}`);

  return (
    <Fragment key={vilkaar}>
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

      {valgteVilkarForVilkaar === BOOLSK_STRING.USANN && <FlytFinnesIkke />}
      {valgteVilkarForVilkaar === BOOLSK_STRING.SANN && !Utils._isEmpty(muligeBegrunnelser) && (
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
                {muligeBegrunnelser.map((begrunnelse) => (
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
