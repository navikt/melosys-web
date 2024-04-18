import PT from "prop-types";

import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import {
  konverterVilkarTilStegData,
  lagVilkaar,
  lagVilkarbegrunnelse,
  slettVilkar,
} from "../../../../felleskomponenter/stegvelger";

import * as Mui from "../../../../felleskomponenter/ui";
import { useEffect } from "react";

const VilkaarKode16 = MKV.Koder.vilkaar.FO_883_2004_ART16_1;
const AVSLAG = "AVSLAG";

export const MultiVilkaar = ({
  oppdaterData,
  slettData,
  vilkaar12,
  vilkaarKode12,
  vilkaar16,
  redigerbart,
  vilkaarNavn12,
  begrunnelser12,
}) => {
  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(vilkaarKode12, vilkaar12));
    oppdaterData(konverterVilkarTilStegData("art16_1", vilkaar16));
  }, []);

  const vilkaarEndret = (event) => {
    const { value } = event.target;

    if (value === vilkaarKode12) {
      oppdaterData(lagVilkaar(vilkaarKode12, true));
      slettData(slettVilkar("art16_1_avslag"));
      slettData(slettVilkar("art16_1_anmodning"));
    } else if (value === VilkaarKode16) {
      oppdaterData(lagVilkaar(vilkaarKode12, false));
      slettData(slettVilkar("art16_1_avslag"));
      oppdaterData(lagVilkaar("art16_1_anmodning", true));
    } else if (value === AVSLAG) {
      oppdaterData(lagVilkaar(vilkaarKode12, false));
      slettData(slettVilkar("art16_1_anmodning"));
      oppdaterData(lagVilkaar("art16_1_avslag", false));
    }
  };

  const begrunnelseEndret = ({ value }, id) => {
    oppdaterData(lagVilkarbegrunnelse(id, value));
  };

  const fritekstEndret = (event) => {
    const { value, id } = event.target;
    oppdaterData(lagVilkarbegrunnelse(id, null, value));
  };

  const hentAvslagBegrunnelser = () => (vilkaar16 ? vilkaar16.begrunnelseKoder || [] : []);

  const innvilgelse = vilkaar12.oppfylt;
  const anmodningOmUnntak = vilkaar12.oppfylt === false && vilkaar16.oppfylt === true;
  const avslag = vilkaar12.oppfylt === false && vilkaar16.oppfylt === false;
  const visFritekstfelt = hentAvslagBegrunnelser().includes(MKV.Koder.begrunnelser.art16_1_avslag.SAERLIG_AVSLAGSGRUNN);

  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">{`Fyller søker kriteriene for artikkel ${vilkaarNavn12}?`}</Nav.Typo.Innholdstittel>
      <div>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="">
              <Nav.Radio
                name="artikkel12"
                onChange={vilkaarEndret}
                value={vilkaarKode12}
                checked={innvilgelse === true}
                label="Ja"
                disabled={!redigerbart}
              />
              <Nav.Radio
                name="artikkel12"
                onChange={vilkaarEndret}
                value={VilkaarKode16}
                checked={anmodningOmUnntak === true}
                label="Nei, jeg vil vurdere artikkel 16.1"
                disabled={!redigerbart}
              />
              <Nav.Radio
                name="artikkel12"
                onChange={vilkaarEndret}
                value={AVSLAG}
                checked={avslag === true}
                label={`Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1`}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            {vilkaar12.oppfylt === false && (
              <Nav.Fieldset legend={`Begrunnelse artikkel ${vilkaarNavn12}:`}>
                <Mui.ListevelgerFlervalg
                  muligeValg={begrunnelser12}
                  label="Legg til begrunnelse for ikke oppfylt:"
                  tillatFritekst={false}
                  onChange={(e) => begrunnelseEndret(e, vilkaarKode12)}
                  defaultElementer={vilkaar12.begrunnelseKoder}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            )}
            {vilkaar16.oppfylt === false && (
              <Nav.Fieldset legend="Begrunnelse artikkel 16.1:">
                <Mui.ListevelgerFlervalg
                  muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                  label="Legg til begrunnelse for avslag:"
                  tillatFritekst={false}
                  onChange={(e) => begrunnelseEndret(e, "art16_1_avslag")}
                  defaultElementer={vilkaar16.begrunnelseKoder}
                  disabled={!redigerbart}
                />
                {visFritekstfelt && (
                  <Nav.Textarea
                    id="art16_1_avslag"
                    label="Begrunnelse for avslag (fritekst):"
                    maxLength={255}
                    bredde="fullbredde"
                    value={vilkaar16.begrunnelseFritekst || ""}
                    onChange={fritekstEndret}
                    disabled={!redigerbart}
                  />
                )}
              </Nav.Fieldset>
            )}
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

MultiVilkaar.propTypes = {
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  vilkaar12: PT.object.isRequired,
  vilkaarNavn12: PT.string.isRequired,
  vilkaarKode12: PT.string.isRequired,
  begrunnelser12: PT.array.isRequired,
  vilkaar16: PT.object.isRequired,
};

MultiVilkaar.defaultProps = {};

export default MultiVilkaar;
