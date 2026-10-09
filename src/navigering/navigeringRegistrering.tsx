import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { registrerNavigate } from "./navigator";

// Må rendres før resten av appen inne i routeren, så navigate er registrert før
// barnas effekter kan navigere.
export function NavigeringRegistrering() {
  const navigate = useNavigate();
  useLayoutEffect(() => registrerNavigate(navigate), [navigate]);
  return null;
}
