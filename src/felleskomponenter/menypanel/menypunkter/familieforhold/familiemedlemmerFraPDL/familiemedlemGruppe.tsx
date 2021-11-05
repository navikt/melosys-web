import React from "react";

import { Familiemedlem } from "../../../../../graphql";

interface FamilimedlemProps {
  familiemedlemmer: Familiemedlem[];
}

const FamilimedlemGruppe = ({ familiemedlemmer }: FamilimedlemProps) => {
  console.log(familiemedlemmer);
  return <div />;
};

export default FamilimedlemGruppe;
