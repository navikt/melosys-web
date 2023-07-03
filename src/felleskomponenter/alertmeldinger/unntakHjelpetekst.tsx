import * as Nav from "../../navFrontend";

const UnntakHjelpetekst = () => {
  return (
    <Nav.EtikettBase type="info">
      <ul>
        <li>Send søknad om unntak som fritekstbrev i &quot;Send brev&quot;-menyen</li>
        <li>Velg &quot;Utenlandsk trygdemyndighet i avtaleland&quot;</li>
        <li>Send orienteringsbrev til bruker/fullmektig i &quot;Send brev&quot;-menyen</li>
        <li>Endre behandlingsstatus til &quot;Avventer svar fra utenlandsk trygdemyndighet&quot;</li>
        <li>Registrer perioden i MEDL som uavklart</li>
      </ul>
      <p>
        <strong>
          Når du får svar fra utenlandsk trygdemyndighet, må du endre valget på dette steget, og fatte vedtak. Dersom du
          skal vurdere frivillig medlemskap må du endre sakstype til &quot;Utenfor avtaleland&quot;.
        </strong>
      </p>
    </Nav.EtikettBase>
  );
};

export default UnntakHjelpetekst;
