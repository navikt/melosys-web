import { useState } from "react";
import { useNavigate } from "react-router";

import * as Nav from "../../../navFrontend";

import "./sokskjema.less";
import { EnkelFellesInputFnrDnrOrgnrSaksnr } from "../../../felleskomponenter/enkelFellesInputFnrDnrOrgnrSaksnr";

function SokSkjema() {
  const navigate = useNavigate();
  const [sokStreng, setSokStreng] = useState("");

  const vedSokSubmit = (event) => {
    event.preventDefault();
    sessionStorage.setItem("sokefrase", sokStreng);
    navigate("/sok");
  };

  return (
    <form className="sokeskjema" onSubmit={vedSokSubmit}>
      <Nav.BodyLong size="small" className="sok__tekst">
        Søk sak:
      </Nav.BodyLong>
      <EnkelFellesInputFnrDnrOrgnrSaksnr
        id="id-sokeskjema"
        label=""
        className="sokeskjema__input"
        bredde="XL"
        onChange={setSokStreng}
        placeholder="F.nr./d-nr./saksnr."
      />

      <div className="sokeskjema__knapp">
        <Nav.Button variant="secondary">Søk</Nav.Button>
      </div>
    </form>
  );
}

export default SokSkjema;
