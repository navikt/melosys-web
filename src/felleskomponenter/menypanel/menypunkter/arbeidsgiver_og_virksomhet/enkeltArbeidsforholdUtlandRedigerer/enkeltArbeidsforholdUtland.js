import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../skjema";
import * as API from "../../../../../services/api";
import * as Utils from "../../../../../utils";

import { fagsakSelectors } from "../../../../../ducks/fagsaker";

const EnkeltArbeidsforholdUtland = ({ redigerbart, overordnetFeltNavn, className, sakstype }) => {
  const [alternativLandsliste, setAlternativLandsliste] = useState();

  useEffect(() => {
    if (sakstype === MKV.Koder.sakstyper.FTRL) {
      API.Kodeverk.hentLandkoderIso2()
        .then((response) => {
          setAlternativLandsliste(
            response
              .sort((a, b) => {
                if (a.term > b.term) return 1;
                if (b.term > a.term) return -1;
                return 0;
              })
              .map((item) => ({ ...item, term: Utils.streng.storeForbokstaver(item.term) }))
          );
        })
        .catch(Utils.logger.error);
    }
  }, [sakstype]);

  return (
    <div className={className}>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Navn på virksomheten" feltNavn={`${overordnetFeltNavn}.navn`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Input label="Registreringsnummer" feltNavn={`${overordnetFeltNavn}.orgnr`} disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input
            label="Adresse til arbeidsgiver"
            feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`}
            disabled={!redigerbart}
          />
        </Nav.Column>
        <Nav.Column xs="3">
          <Skjema.Input label="Poststed" feltNavn={`${overordnetFeltNavn}.adresse.poststed`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Skjema.Input
            label="Postnummer"
            feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Region" feltNavn={`${overordnetFeltNavn}.adresse.region`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.LandVelger
            label="Land"
            feltNavn={`${overordnetFeltNavn}.adresse.landkode`}
            disabled={!redigerbart}
            bredde="fullbredde"
            landkoder={alternativLandsliste}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

EnkeltArbeidsforholdUtland.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  className: PT.string,
  sakstype: PT.string.isRequired,
};

EnkeltArbeidsforholdUtland.defaultProps = {
  className: undefined,
};

const mapStateToProps = (state) => ({
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
});

export default connect(mapStateToProps)(EnkeltArbeidsforholdUtland);
