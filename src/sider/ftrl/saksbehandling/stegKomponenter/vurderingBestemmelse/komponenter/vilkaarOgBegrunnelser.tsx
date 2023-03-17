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
  alleValgteBegrunnelser: Map<string, string>;
  vilkårKodeverk: KTObject[];
  begrunnelseKodeverk: { [key: string]: KTObject[] };
  handleEndreVilkår: ChangeEventHandler<HTMLInputElement>;
  handleEndreBegrunnelse: ChangeEventHandler<HTMLSelectElement>;
  redigerbart: boolean;
}

export const VilkaarOgBegrunnelser = ({
  vilkårOgBegrunnelser: { vilkår, muligeBegrunnelser },
  alleValgteVilkår,
  alleValgteBegrunnelser,
  vilkårKodeverk,
  begrunnelseKodeverk,
  handleEndreVilkår,
  handleEndreBegrunnelse,
  redigerbart,
}: VilkaarOgBegrunnelserProps) => {
  const hjelpetekstForVilkaar = hjelpetekster.get(vilkår);
  const valgtVilkår = alleValgteVilkår.get(`${vilkår}`);

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
              label="Særlig grunn"
              hjelpetekst="Grunnen du velger utløser en standardtekst i vedtaksbrevet."
            />
          }
        >
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                label=""
                bredde="fullbredde"
                onChange={handleEndreBegrunnelse}
                name={`${vilkår}_begrunnelser`}
                value={alleValgteBegrunnelser.get(`${vilkår}_begrunnelser`)}
                disabled={!redigerbart}
              >
                <option key="" value="" disabled={!!alleValgteBegrunnelser.get(`${vilkår}_begrunnelser`)}>
                  Velg
                </option>
                {muligeBegrunnelser.map((begrunnelse) => (
                  <option key={begrunnelse} value={begrunnelse}>
                    {KV.termFraNestedKTObject(begrunnelseKodeverk, begrunnelse)}
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
