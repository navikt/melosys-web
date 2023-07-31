import { MouseEventHandler } from "react";

import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";

import * as Mui from "../../../../ui";
import "./enkeltfoedestedoglandskjema.css";

interface EnkeltFoedestedOgLandSkjemaProps {
  redigerbart: boolean;
  onBinClick: MouseEventHandler;
}

const Enkeltfoedestedoglandskjema = ({ redigerbart, onBinClick }: EnkeltFoedestedOgLandSkjemaProps) => (
  <Nav.Row className="enkeltFoedestedOgLandSkjema">
    <Nav.Column xs="5">
      <Skjema.Input disabled={!redigerbart} feltNavn="foedestedOgLand.foedested" label="Fødested" bredde="fullbredde" />
    </Nav.Column>
    <Nav.Column xs="5">
      <Skjema.LandVelger
        disabled={!redigerbart}
        feltNavn="foedestedOgLand.foedeland"
        label="Fødeland"
        bredde="fullbredde"
        visAlleLandkoder
      />
    </Nav.Column>
    <Nav.Column xs="2" className="slett__symbol">
      <Mui.IkonKnapp ariaLabel="Slett fødested og -land" ikon={Ikoner.Bin} onClick={onBinClick} />
    </Nav.Column>
  </Nav.Row>
);

export default Enkeltfoedestedoglandskjema;
