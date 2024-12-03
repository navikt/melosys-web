import { useSelector } from "react-redux";
import * as Utils from "../../utils";

import "./errorBoundary.css";
import ErrorMessage from "./errorMessage";
import { RootState } from "AppTypes";
import { ReactNode } from "react";

interface ErrorObject {
  varselTekst: string;
  status: number;
  statusTekst: string;
  fetchdata: any;
}

const parseStructuredPayload = (varselTekst: string, payload: any): ErrorObject => {
  const { data } = payload;
  const fetchdata = Utils.isJSON(data) ? JSON.parse(data) : data;

  const { status, message: statusTekst } = fetchdata;
  return {
    status,
    statusTekst,
    varselTekst,
    fetchdata,
  };
};
const parseErrorObject = (varselTekst: string, currentReduxState: any): ErrorObject => {
  const { data: payload, status } = currentReduxState;

  if (Utils._isString(payload)) {
    return {
      status,
      statusTekst: payload,
      varselTekst,
      fetchdata: { timestamp: Date() },
    };
  }

  return parseStructuredPayload(varselTekst, payload);
};

interface ErrorBoundaryProps {
  kontekster: {
    slice: string;
    varselTekst: string;
  }[];
  children: ReactNode;
}

function ErrorBoundary({ kontekster, children }: ErrorBoundaryProps) {
  const rootState = useSelector((state: RootState) => state);
  const feilSamling: ErrorObject[] = [];

  kontekster.forEach(({ slice, varselTekst }) => {
    // @ts-expect-error generisk beskrivelse
    const currentSlice = rootState[slice];
    const { status: feilStatus } = currentSlice;
    if (feilStatus === "ERROR") {
      const eobj = parseErrorObject(varselTekst, currentSlice);
      feilSamling.push(eobj);
    }
  });

  if (feilSamling.length === 0) {
    return children;
  }

  feilSamling.sort((a, b) => b.status - a.status);

  if (feilSamling[0].status === 404) {
    return (
      <div className="errorContainer">
        <ErrorMessage feilobjekt={feilSamling[0]} />
      </div>
    );
  }

  return (
    <div className="errorContainer">
      <ErrorMessage feilobjekt={feilSamling[0]} />
    </div>
  );
}

export default ErrorBoundary;
