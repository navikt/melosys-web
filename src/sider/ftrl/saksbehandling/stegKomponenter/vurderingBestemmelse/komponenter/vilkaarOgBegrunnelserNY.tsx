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
  handleEndreVilkår: (name: string, value: boolean) => void;
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
  const vilkårErValgt = alleValgteVilkår.get(`${vilkår}`);
  const valgtBegrunnelseForVilkår = alleValgteBegrunnelser.get(`${vilkår}`)!!;
  const visBegrunnelseFritekst = kodeInkludererFritekst(
    MKV.KTObjects.begrunnelser.folketrygdloven,
    valgtBegrunnelseForVilkår?.begrunnelseKode
  );
  const harValgtFTRL_ARBEIDSTAKER = vilkår === MKV.Koder.vilkaar.FTRL_ARBEIDSTAKER && vilkårErValgt;

  return (
    <Fragment>
      <Nav.RadioGroup
        legend={
          <LabelMedHjelpetekst
            label={KV.finnTermFraListe(MKV.KTObjects.vilkaar, vilkår)}
            hjelpetekst={hjelpetekstForVilkaar}
          />
        }
        onChange={(value) => handleEndreVilkår(vilkår, value)}
        name={vilkår}
        defaultValue={vilkårErValgt}
        disabled={!redigerbart}
      >
        <Nav.Radio value>Ja</Nav.Radio>
        <Nav.Radio value={false}>Nei</Nav.Radio>
      </Nav.RadioGroup>
      {selvstendigNæringValgt && harValgtFTRL_ARBEIDSTAKER && (
        <Nav.Alert variant="error">
          Virksomheten du har valgt på steget &quot;Virksomhet&quot; er en selvstendig virksomhet
        </Nav.Alert>
      )}
      {vilkårErValgt === false && <IngenFlytMelding />}
      {vilkårErValgt && !Utils._isEmpty(muligeBegrunnelser) && (
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
