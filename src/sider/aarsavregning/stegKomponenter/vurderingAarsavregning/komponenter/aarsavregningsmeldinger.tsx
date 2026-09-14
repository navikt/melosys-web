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
      <Nav.BodyLong size="small" weight="semibold">
        Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema
      </Nav.BodyLong>
      <Nav.BodyLong size="small">Støtte vil bli gjort tilgjengelig senere.</Nav.BodyLong>
    </Nav.Alert>
  );
}

export const Aarsavregningsmeldinger = {
  TrygdeavgiftErIkkeForskuddsvisFakturert,
  TrygdeavgiftSkalIkkeBetalesTilNav,
  ÅrsavregningIkkeStøttetSakstypeMelding,
};
