import { useState, useEffect } from "react";

type MediaQuery = {
  minWidth?: number;
  maxWidth?: number;
};

const getQueryString = (query: MediaQuery) => {
  const { minWidth, maxWidth } = query;
  const isAndQuery = minWidth && maxWidth;
  return `${minWidth ? `(min-width:${minWidth}px)` : ""}${isAndQuery ? " and " : ""}${
    maxWidth ? `(max-width:${maxWidth}px)` : ""
  }`;
};

export function useMediaQuery(query: MediaQuery) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const queryString = getQueryString(query);
    const media = window.matchMedia(queryString);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
