import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { change } from "redux-form";
import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";

export const erOffentligEtat = (rolle: string | undefined) => rolle === KV.Koder.MottakerRolle.OFFENTLIG_ETAT;

const BrevMottakerOffentligEtat = () => {
  const [tilgjengeligeOffentligeEtater, setTilgjengeligeOffentligeEtater] =
    useState<Api.DokumenterV2.TilgjengeligeOffentligeEtaterResDto>();
  const [valgteEtater, setValgteEtater] = useState<string[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeOffentligeEtater().then((response) => setTilgjengeligeOffentligeEtater(response));
  }, []);

  useEffect(() => {
    dispatch(change(KV.Form.SEND_BREV, "offentligeEtater", valgteEtater));
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
      <Nav.Typo.Element>Hvilke etater skal brevet sendes til?</Nav.Typo.Element>
      {tilgjengeligeOffentligeEtater &&
        tilgjengeligeOffentligeEtater.map((etat) => (
          <Nav.Checkbox label={etat.navn} key={etat.orgnr} onChange={() => handleCheckboxChange(etat.orgnr)} />
        ))}
    </>
  );
};

export default BrevMottakerOffentligEtat;
