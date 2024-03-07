import { ChangeEventHandler, Fragment } from "react";

import MKV from "../../../../../../melosyskodeverk";
import * as KV from "../../../../../../kodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import HtmlEditor from "../../../../../../felleskomponenter/htmlEditor";
import { Begrunnelse, kodeInkludererFritekst } from "../vurderingBestemmelse";
import { IngenFlytMelding } from "../../../../../../felleskomponenter/alertmeldinger";
import { VilkårOgBegrunnelser } from "./typer";

const hjelpetekster = new Map([
  [
    MKV.Koder.vilkaar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
    "Husk at perioder med trygdetid fra andre EØS-land sidestilles med norsk trygdetid.",
  ],
]);

interface VilkaarOgBegrunnelserProps {
  vilkårOgBegrunnelser: VilkårOgBegrunnelser;
  alleValgteVilkår: Map<string, boolean | null | undefined>;
  alleValgteBegrunnelser: Map<string, Begrunnelse>;
  handleEndreVilkår: ChangeEventHandler<HTMLInputElement>;
  handleEndreBegrunnelseKode: ChangeEventHandler<HTMLSelectElement>;
  handleEndreBegrunnelseFritekst: (vilkår: string, fritekst: string) => void;
  redigerbart: boolean;
  selvstendigNæringValgt?: boolean;
}

export const VilkaarOgBegrunnelserNY = ({
  vilkårOgBegrunnelser: { vilkår, muligeBegrunnelser },
  alleValgteVilkår,
  alleValgteBegrunnelser,
  handleEndreVilkår,
  handleEndreBegrunnelseKode,
  handleEndreBegrunnelseFritekst,
  redigerbart,
  selvstendigNæringValgt,
}: VilkaarOgBegrunnelserProps) => {
  const hjelpetekstForVilkaar = hjelpetekster.get(vilkår);
  const valgtVilkår = alleValgteVilkår.get(`${vilkår}`);
  const valgtBegrunnelseForVilkår = alleValgteBegrunnelser.get(`${vilkår}`)!!;
  const visBegrunnelseFritekst = kodeInkludererFritekst(
    MKV.KTObjects.begrunnelser.folketrygdloven,
    valgtBegrunnelseForVilkår?.begrunnelseKode
  );
  const harValgtFTRL_ARBEIDSTAKER = vilkår === MKV.Koder.vilkaar.FTRL_ARBEIDSTAKER && valgtVilkår;

  return (
    <Fragment>
      <Nav.Fieldset
        legend={
          <LabelMedHjelpetekst
            label={KV.finnTermFraListe(MKV.KTObjects.vilkaar, vilkår)}
            hjelpetekst={hjelpetekstForVilkaar}
          />
        }
      >
        <Nav.Row>
          <Nav.Column xs="1">
            <Nav.Radio
              className="radio"
              label="Ja"
              name={vilkår}
              onChange={handleEndreVilkår}
              checked={valgtVilkår === true}
              value="true"
              key="true"
              disabled={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column xs="1">
            <Nav.Radio
              className="radio"
              label="Nei"
              name={vilkår}
              onChange={handleEndreVilkår}
              checked={valgtVilkår === false}
              value="false"
              key="false"
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {selvstendigNæringValgt && harValgtFTRL_ARBEIDSTAKER && (
        <Nav.AlertStripeFeil>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Virksomheten du har valgt på steget "Virksomhet" er en selvstendig virksomhet
        </Nav.AlertStripeFeil>
      )}
      {valgtVilkår === false && <IngenFlytMelding />}
      {valgtVilkår && !Utils._isEmpty(muligeBegrunnelser) && (
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
                onChange={handleEndreBegrunnelseKode}
                name={`${vilkår}`}
                value={valgtBegrunnelseForVilkår?.begrunnelseKode}
                disabled={!redigerbart}
              >
                <option key="" value="" disabled={!!alleValgteBegrunnelser.get(`${vilkår}`)}>
                  Velg...
                </option>
                {muligeBegrunnelser.map((begrunnelse) => (
                  <option key={begrunnelse} value={begrunnelse}>
                    {KV.termFraNestedKTObject(MKV.KTObjects.begrunnelser.folketrygdloven, begrunnelse)}
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
                  onChange={(fritekst: string) => handleEndreBegrunnelseFritekst(`${vilkår}`, fritekst)}
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
