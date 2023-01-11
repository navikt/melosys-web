import React, { useState } from "react";

import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";

export const erOffentligEtat = (rolle: string | undefined) => rolle === KV.Koder.MottakerRolle.OFFENTLIG_ETAT;

type BrevMottakerOffentligEtatType = { offentligeEtater: Api.DokumenterV2.TilgjengeligeOffentligeEtaterResDto };
const BrevMottakerOffentligEtat = ({ offentligeEtater }: BrevMottakerOffentligEtatType) => {
  const [valgteEtater, setValgteEtater] = useState<string[]>([]);

  const handleCheckboxChange = (item: string) => {
    if (valgteEtater.includes(item)) {
      setValgteEtater(valgteEtater.filter((i) => i !== item));
    } else {
      setValgteEtater([...valgteEtater, item]);
    }
  };

  return (
    <>
      {offentligeEtater.map((etat) => (
        <Nav.Checkbox label={etat.navn} key={etat.orgnr} onChange={() => handleCheckboxChange(etat.orgnr)} />
      ))}
      {valgteEtater.map((orng) => (
        <p key={orng}>{orng}</p>
      ))}
    </>
  );
};

export default BrevMottakerOffentligEtat;
