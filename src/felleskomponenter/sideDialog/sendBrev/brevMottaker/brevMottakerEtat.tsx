import React, { useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch } from "react-redux";
import { change, getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import { SendBrevFormValues } from "../types";

export const erEtat = (rolle: string | undefined) => rolle === KV.Koder.MottakerRolle.ETAT;

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const BrevMottakerEtat = ({ formValues }: PropsFromRedux) => {
  const [tilgjengeligeEtater, setTilgjengeligeEtater] = useState<Api.DokumenterV2.TilgjengeligeEtaterResDto>();
  const [valgteEtater, setValgteEtater] = useState<string[]>(formValues?.etater || []);

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
      <Nav.Typo.Element className="brevmottaker__etat">Hvilke etater skal brevet sendes til?</Nav.Typo.Element>
      <Nav.Row>
        <Nav.Column xs="12">
          {tilgjengeligeEtater?.map((etat) => (
            <Nav.Checkbox
              label={etat.navn}
              key={etat.orgnr}
              checked={valgteEtater.includes(etat.orgnr)}
              onChange={() => handleCheckboxChange(etat.orgnr)}
            />
          ))}
        </Nav.Column>
      </Nav.Row>
    </>
  );
};

export default connector(BrevMottakerEtat);
