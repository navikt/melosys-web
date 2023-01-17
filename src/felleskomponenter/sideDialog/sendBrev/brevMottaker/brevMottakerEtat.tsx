import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { change } from "redux-form";
import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";

export const erEtat = (rolle: string | undefined) => rolle === KV.Koder.MottakerRolle.ETAT;

const BrevMottakerEtat = () => {
  const [tilgjengeligeEtater, setTilgjengeligeEtater] = useState<Api.DokumenterV2.TilgjengeligeEtaterResDto>();
  const [valgteEtater, setValgteEtater] = useState<string[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeEtater().then((response) => setTilgjengeligeEtater(response));
  }, []);

  useEffect(() => {
    dispatch(change(KV.Form.SEND_BREV, "etater", valgteEtater));
  }, [valgteEtater]);

  const handleCheckboxChange = (item: string) => {
    if (valgteEtater.includes(item)) {
      setValgteEtater(valgteEtater.filter((i) => i !== item));
    } else {
      setValgteEtater([...valgteEtater, item]);
    }
  };

  return (
    <>
      <Nav.Typo.Element className="brev-mottaker-offentlig-etat">
        Hvilke etater skal brevet sendes til?
      </Nav.Typo.Element>
      <Nav.Row>
        <Nav.Column xs="12">
          {tilgjengeligeEtater &&
            tilgjengeligeEtater.map((etat) => (
              <Nav.Checkbox label={etat.navn} key={etat.orgnr} onChange={() => handleCheckboxChange(etat.orgnr)} />
            ))}
        </Nav.Column>
      </Nav.Row>
    </>
  );
};

export default BrevMottakerEtat;
