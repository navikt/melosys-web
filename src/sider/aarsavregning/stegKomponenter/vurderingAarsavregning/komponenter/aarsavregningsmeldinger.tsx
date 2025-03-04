import * as Nav from "../../../../../navFrontend";

function TrygdeavgiftErIkkeForskuddsvisFakturert() {
  return (
    <Nav.Alert variant="info" className="alertstripe_feilmelding">
      Trygdeavgift er ikke forskuddsvis fakturert
    </Nav.Alert>
  );
}

function TrygdeavgiftSkalIkkeBetalesTilNav() {
  return (
    <Nav.Alert variant="info" className="alertstripe_feilmelding">
      Trygdeavgift skal ikke betales til NAV
    </Nav.Alert>
  );
}

export const Aarsavregningsmeldinger = { TrygdeavgiftErIkkeForskuddsvisFakturert, TrygdeavgiftSkalIkkeBetalesTilNav };
