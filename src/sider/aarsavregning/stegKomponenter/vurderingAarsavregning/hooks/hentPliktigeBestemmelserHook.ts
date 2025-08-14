import { useState, useEffect } from "react";
import * as Api from "../../../../../services/api";

export const hentPliktigeBestemmelserHook = () => {
  const [pliktigeBestemmelser, setPliktigeBestemmelser] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      Api.Ftrl.hentPliktigeBestemmelser()
        .then((res) => {
          setPliktigeBestemmelser(res.bestemmelser);
          setLoaded(true);
        })
        .catch(() => {
          setPliktigeBestemmelser([]);
          setLoaded(true);
        });
    }
  }, [loaded]);

  return pliktigeBestemmelser;
};
