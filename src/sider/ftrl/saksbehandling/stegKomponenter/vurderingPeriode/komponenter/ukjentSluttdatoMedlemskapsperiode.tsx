import * as Nav from "../../../../../../navFrontend";

interface UkjentSluttdatoProps {
  ukjentSluttdatoMedlemskapsperiode: boolean;
  onUkjentSluttdatoChange: (checked: boolean) => void;
  erPensjonist?: boolean;
}

export function UkjentSluttdatoMedlemskapsperiode({
  ukjentSluttdatoMedlemskapsperiode,
  onUkjentSluttdatoChange,
  erPensjonist,
}: UkjentSluttdatoProps) {
  return (
    <div className="ukjentSluttdato">
      <Nav.Checkbox
        checked={ukjentSluttdatoMedlemskapsperiode}
        onChange={(e) => onUkjentSluttdatoChange(e.target.checked)}
      >
        {erPensjonist
          ? "Vedtaksbrevet skal ikke ha sluttdato"
          : "Saken er flyttet fra avgiftssystemet og har ikke sluttdato"}
      </Nav.Checkbox>
      {ukjentSluttdatoMedlemskapsperiode && (
        <Nav.Alert variant="info" size="small" className="mt-2">
          Sluttdato er automatisk satt 10 år frem i tid. Sluttdato vil ikke komme med i vedtaksbrevet. Hvis sluttdato
          likevel skal komme med i vedtaksbrevet, må du fjerne avhukingen.
        </Nav.Alert>
      )}
    </div>
  );
}
