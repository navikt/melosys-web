import { useEffect, useState } from "react";
import PT from "prop-types";
import classnames from "classnames";
import { v4 as uuid } from "uuid";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";

import EnkeltLandPure from "../../../felleskomponenter/skjema/landvelger/enkeltLandPure";
import * as Mui from "../../../felleskomponenter/ui";

import {
  avklartefaktaType,
  konverterAvklartfaktaTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
} from "../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../domeneUtils";

import "./vurderingBostedsland.css";

const Avklaringer = ({ avklaringer }) => (
  <div>
    <ul className="betingelser__liste">
      {avklaringer.map(({ tekst, status }) => {
        let iconClassName;
        if (status === undefined) {
          iconClassName = "liste__element--varsel";
        }
        const cl = classnames({ liste__element: true, [iconClassName]: true });
        return (
          <li key={uuid()} className={cl}>
            {tekst}
          </li>
        );
      })}
    </ul>
  </div>
);

Avklaringer.propTypes = {
  avklaringer: PT.array,
};

Avklaringer.defaultProps = {
  avklaringer: [],
};

const VurderingBostedsland = (props) => {
  const { bekreftOgFortsett, tilstand, begrunnelser, redigerbart, oppdaterData, slettData, tilbake } = props;

  useEffect(() => {
    const { bostedslandFakta } = tilstand;
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, bostedslandFakta));
    return () => {
      slettData();
    };
  }, []);

  const { bostedslandFakta, harAvklaring, erBegrunnelserPaakrevd } = tilstand;

  const erBosattINorge = () => {
    const bostedsland = hentFaktaVerdi(bostedslandFakta);
    if (Utils._isNil(bostedsland)) {
      return null;
    }
    return bostedsland === MKV.Koder.landkoder.NO;
  };

  const [erNorgeValgt, setNorgeErValgt] = useState(erBosattINorge());

  const radioEndringHandler = (event) => {
    if (event.target.value === "true") {
      setNorgeErValgt(true);
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, MKV.Koder.landkoder.NO, null));
    } else {
      setNorgeErValgt(false);
      slettData(avklartefaktaType, KV.Koder.avklartefaktaKoder.BOSTEDSLAND);
    }
  };

  const landEndretHandler = (landKode) => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, landKode));
  };

  const begrunnelseEndret = (begrunnelseKoder) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, begrunnelseKoder));
  };

  const eksisterendeLand = hentFaktaVerdi(bostedslandFakta) || "";

  return (
    <div className="vurderingBostedsland">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Vurder bosted (&#171;sentrum for livsinteresser&#187;)
      </Nav.Typo.Innholdstittel>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Bostedsland er:">
              <Nav.Radio
                name="bostedsland"
                label="Norge"
                value
                onChange={radioEndringHandler}
                checked={erNorgeValgt === true}
                disabled={!redigerbart}
              />
              <Nav.Radio
                name="bostedsland"
                label="Annet"
                value={false}
                onChange={radioEndringHandler}
                checked={erNorgeValgt === false}
                disabled={!redigerbart}
              />
              {erNorgeValgt === false && (
                <Nav.Row>
                  <Nav.Column xs="8" md="6" lg="4">
                    <EnkeltLandPure
                      label="Velg land:"
                      value={eksisterendeLand}
                      onChange={landEndretHandler}
                      changeOnEmptyValue
                      landkoder={MKV.KTObjects.landkoder}
                      disabled={!redigerbart}
                    />
                  </Nav.Column>
                </Nav.Row>
              )}
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        {erBegrunnelserPaakrevd && erNorgeValgt === false && (
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Fieldset legend="">
                <Mui.Checkboxgruppe
                  muligeValg={begrunnelser}
                  legend="Legg til begrunnelse:"
                  onChange={begrunnelseEndret}
                  defaultValg={bostedslandFakta.begrunnelseKoder}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        )}
      </div>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  tilstand: PT.object,
  vurdering: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
  vurdering: {},
  begrunnelser: [],
};

export default VurderingBostedsland;
