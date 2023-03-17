import React, { ChangeEventHandler, Fragment, useCallback } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../../melosyskodeverk";
import * as Api from "../../../../../../services/api";
import * as KV from "../../../../../../kodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import HtmlEditor from "../../../../../../felleskomponenter/htmlEditor";
import { BOOLSK_STRING } from "../../../../../../constants";
import { Begrunnelse } from "../vurderingBestemmelse";
import { FlytFinnesIkke } from "./flytFinnesIkke";

const { SANN, USANN } = BOOLSK_STRING;
const hjelpetekster = new Map([
  [
    MKV.Koder.vilkaar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
    "Husk at perioder med trygdetid fra andre EØS-land sidestilles med norsk trygdetid.",
  ],
]);

interface VilkaarOgBegrunnelserProps {
  vilkårOgBegrunnelser: Api.Medlemskapsperioder.VilkårOgBegrunnelser;
  alleValgteVilkår: Map<string, string>;
  alleValgteBegrunnelser: Map<string, Begrunnelse>;
  vilkårKodeverk: KTObject[];
  begrunnelseKodeverk: { [key: string]: KTObject[] };
  handleEndreVilkår: ChangeEventHandler<HTMLInputElement>;
  handleEndreBegrunnelseKode: ChangeEventHandler<HTMLSelectElement>;
  handleEndreBegrunnelseFritekst: (vilkår: string, fritekst: string) => void;
  redigerbart: boolean;
}

export const VilkaarOgBegrunnelser = ({
  vilkårOgBegrunnelser: { vilkår, muligeBegrunnelser },
  alleValgteVilkår,
  alleValgteBegrunnelser,
  vilkårKodeverk,
  begrunnelseKodeverk,
  handleEndreVilkår,
  handleEndreBegrunnelseKode,
  handleEndreBegrunnelseFritekst,
  redigerbart,
}: VilkaarOgBegrunnelserProps) => {
  const hjelpetekstForVilkaar = hjelpetekster.get(vilkår);
  const valgtVilkår = alleValgteVilkår.get(`${vilkår}`);
  const valgtBegrunnelseForVilkår = alleValgteBegrunnelser.get(`${vilkår}_begrunnelser`);

  const debouncedHandleEndreBegrunnelseFritekst = useCallback(
    Utils._debounce(
      (vilkår_begrunnelser, fritekst) => handleEndreBegrunnelseFritekst(vilkår_begrunnelser, fritekst),
      750
    ),
    []
  );

  const visBegrunnelseFritekst = KV.termFraNestedKTObject(
    begrunnelseKodeverk,
    valgtBegrunnelseForVilkår?.begrunnelseKode
  )?.includes("(fritekst)");

  return (
    <Fragment>
      <Nav.Fieldset
        className="radio"
        legend={
          <LabelMedHjelpetekst
            label={KV.finnTermFraListe(vilkårKodeverk, vilkår)}
            hjelpetekst={hjelpetekstForVilkaar}
          />
        }
      >
        <Nav.Row>
          <Nav.Column xs="1">
            <Nav.Radio
              label="Ja"
              name={vilkår}
              onChange={handleEndreVilkår}
              checked={valgtVilkår === SANN}
              value={SANN}
              key={SANN}
              disabled={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column xs="1">
            <Nav.Radio
              label="Nei"
              name={vilkår}
              onChange={handleEndreVilkår}
              checked={valgtVilkår === USANN}
              value={USANN}
              key={USANN}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {valgtVilkår === USANN && <FlytFinnesIkke />}
      {valgtVilkår === SANN && !Utils._isEmpty(muligeBegrunnelser) && (
        <Nav.Fieldset
          className="select"
          legend={
            <LabelMedHjelpetekst
              label="Velg særlig grunn"
              hjelpetekst="Nedtrekksmenyen inneholder grupper av personer som kan tas opp etter en rimelighetsvurdering i tilfeller der en søknad om medlemskap vurderes etter § 2-8 andre ledd."
            />
          }
        >
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                label=""
                bredde="fullbredde"
                onChange={handleEndreBegrunnelseKode}
                name={`${vilkår}_begrunnelser`}
                value={valgtBegrunnelseForVilkår?.begrunnelseKode}
                disabled={!redigerbart}
              >
                <option key="" value="" disabled={!!alleValgteBegrunnelser.get(`${vilkår}_begrunnelser`)}>
                  Velg...
                </option>
                {muligeBegrunnelser.map((begrunnelse) => (
                  <option key={begrunnelse} value={begrunnelse}>
                    {KV.termFraNestedKTObject(begrunnelseKodeverk, begrunnelse)}
                  </option>
                ))}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
          {visBegrunnelseFritekst && (
            <Nav.Row>
              <Nav.Column xs="12">
                <HtmlEditor
                  value={valgtBegrunnelseForVilkår?.begrunnelseFritekst || ""}
                  onChange={(fritekst: string) =>
                    debouncedHandleEndreBegrunnelseFritekst(`${vilkår}_begrunnelser`, fritekst)
                  }
                  placeholder="Vennligst spesifiser..."
                  spellCheck
                  readOnly={!redigerbart}
                  disabled={!redigerbart}
                />
              </Nav.Column>
            </Nav.Row>
          )}
        </Nav.Fieldset>
      )}
    </Fragment>
  );
};
