import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import Sletterad from "../sletterad";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

function Redigerer({
  redigerbart,
  overordnetFeltNavn,
  slett,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.FysiskArbeidssted>) {
  const adresse = verdier?.adresse;
  const harTilleggsnavn = !!adresse?.tilleggsnavn;
  const harRegion = !!adresse?.region;
  const harPostboks = !!adresse?.postboks;

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="9">
          <Skjema.Input
            label="Navn på virksomhet"
            feltNavn={`${overordnetFeltNavn}.virksomhetNavn`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {harTilleggsnavn && (
        <Nav.Row>
          <Nav.Column xs="9">
            <Skjema.Input
              label="Adressetilleggsnavn"
              feltNavn={`${overordnetFeltNavn}.adresse.tilleggsnavn`}
              disabled
            />
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row>
        <Nav.Column xs="5">
          <Skjema.Input label="Gate/veg" feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="4">
          <Skjema.Input
            label="Husnummer"
            feltNavn={`${overordnetFeltNavn}.adresse.husnummerEtasjeLeilighet`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          <Skjema.Input label="Poststed" feltNavn={`${overordnetFeltNavn}.adresse.poststed`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="4">
          <Skjema.Input
            label="Postnummer"
            feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {harPostboks && (
        <Nav.Row>
          <Nav.Column xs="9">
            <Skjema.Input label="Postboks" feltNavn={`${overordnetFeltNavn}.adresse.postboks`} disabled />
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row>
        {harRegion && (
          <Nav.Column xs="5">
            <Skjema.Input label="Region" feltNavn={`${overordnetFeltNavn}.adresse.region`} disabled />
          </Nav.Column>
        )}
        <Nav.Column xs="4">
          <Skjema.LandVelger label="Land" feltNavn={`${overordnetFeltNavn}.adresse.landkode`} disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Sletterad onClick={slett} />
    </div>
  );
}

export default Redigerer;
