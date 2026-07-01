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

function ÅrsavregningIkkeStøttetSakstypeMelding() {
  return (
    <Nav.Alert variant="warning" className="alertstripe_feilmelding" data-testid="aarsavregning-ikke-stottet-sakstype">
      Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema. Støtte vil bli gjort tilgjengelig
      senere.
    </Nav.Alert>
  );
}

export const Aarsavregningsmeldinger = {
  TrygdeavgiftErIkkeForskuddsvisFakturert,
  TrygdeavgiftSkalIkkeBetalesTilNav,
  ÅrsavregningIkkeStøttetSakstypeMelding,
};
