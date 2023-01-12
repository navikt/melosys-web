import React, { useEffect, useState } from "react";

import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";

export const erOffentligEtat = (rolle: string | undefined) => rolle === KV.Koder.MottakerRolle.OFFENTLIG_ETAT;

const BrevMottakerOffentligEtat = () => {
  const [offentligeEtater, setOffentligeEtater] = useState<Api.DokumenterV2.TilgjengeligeOffentligeEtaterResDto>();
  const [valgteEtater, setValgteEtater] = useState<string[]>([]);

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeOffentligeEtater().then((response) => setOffentligeEtater(response));
  }, []);

  const handleCheckboxChange = (item: string) => {
    if (valgteEtater.includes(item)) {
      setValgteEtater(valgteEtater.filter((i) => i !== item));
    } else {
      setValgteEtater([...valgteEtater, item]);
    }
  };

  return (
    <>
      {offentligeEtater &&
        offentligeEtater.map((etat) => (
          <Nav.Checkbox label={etat.navn} key={etat.orgnr} onChange={() => handleCheckboxChange(etat.orgnr)} />
        ))}

      {valgteEtater.map((orng) => (
        <p key={orng}>{orng}</p>
      ))}
    </>
  );
};

export default BrevMottakerOffentligEtat;
