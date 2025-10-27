import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";

interface Props {
  redigerbart: boolean;
  tilbake: () => void;
  bekreft: () => void;
}

export function VurderingPeriodeOffentligAnsatt({ redigerbart, tilbake, bekreft }: Props) {
  return (
    <div className="vurderingPeriodeOffentligAnsatt">
      <Nav.Heading level="1" className="stegvelgertittel">
        Lovvalgsbestemmelse og -periode
      </Nav.Heading>

      <Nav.BodyLong>Dette steget er under utvikling. Her skal bestemmelse og periode håndteres.</Nav.BodyLong>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !redigerbart,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
}

export default VurderingPeriodeOffentligAnsatt;
