import type { ComponentType } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import type { Location, NavigateFunction, Params } from "react-router";

export interface RuteProps {
  params: Readonly<Params<string>>;
  location: Location;
  navigate: NavigateFunction;
}

// Klassekomponenter kan ikke bruke routerens hooks, så de får verdiene som props.
export function medRuteProps<P extends RuteProps>(Komponent: ComponentType<P>) {
  function MedRuteProps(props: Omit<P, keyof RuteProps>) {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    return <Komponent {...(props as P)} params={params} location={location} navigate={navigate} />;
  }
  MedRuteProps.displayName = `medRuteProps(${Komponent.displayName || Komponent.name || "Komponent"})`;
  return MedRuteProps;
}
