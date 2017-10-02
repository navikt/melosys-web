// Bruker denne for å slippe å sette key på alle barn.
// Trenger react@16.x.x for at denne skal fungere som forventet.

function JustChildren({ children }) {
  return children;
}

export default JustChildren;