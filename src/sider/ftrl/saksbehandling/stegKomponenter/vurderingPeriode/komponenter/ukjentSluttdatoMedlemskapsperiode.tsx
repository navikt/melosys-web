import * as Nav from "../../../../../../navFrontend";

interface UkjentSluttdatoProps {
  ukjentSluttdatoMedlemskapsperiode: boolean;
  onUkjentSluttdatoChange: (checked: boolean) => void;
  erPensjonist?: boolean;
  erEøsPensjonist?: boolean;
}

export function UkjentSluttdatoMedlemskapsperiode({
  ukjentSluttdatoMedlemskapsperiode,
  onUkjentSluttdatoChange,
  erPensjonist,
  erEøsPensjonist,
}: UkjentSluttdatoProps) {
  const textForIkkeEøsPensjonist = erPensjonist
    ? "Vedtaksbrevet skal ikke ha sluttdato"
    : "Saken er flyttet fra avgiftssystemet og har ikke sluttdato";

  const brevType = erEøsPensjonist ? "orienteringsbrevet" : "vedtaksbrevet";

  return (
    <div className="ukjentSluttdato">
      <Nav.Checkbox
        checked={ukjentSluttdatoMedlemskapsperiode}
        onChange={(e) => onUkjentSluttdatoChange(e.target.checked)}
      >
        {erEøsPensjonist ? "Det er ikke oppgitt en sluttdato. Perioden er åpen." : textForIkkeEøsPensjonist}
      </Nav.Checkbox>
      {ukjentSluttdatoMedlemskapsperiode && (
        <Nav.Alert variant="info" size="small" className="mt-2">
          Sluttdato er automatisk satt 10 år frem i tid. Sluttdato vil ikke komme med i {brevType}. Hvis sluttdato
          likevel skal komme med i vedtaksbrevet, må du fjerne avhukingen.
        </Nav.Alert>
      )}
    </div>
  );
}
