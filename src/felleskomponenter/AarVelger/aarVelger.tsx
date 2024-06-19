import { useState } from "react";
import { HStack, Select } from "@navikt/ds-react";

interface YearSelectorProps {
  onForandringAvAar: (year: number) => void;
}

function AarVelger(props: YearSelectorProps) {
  const { onForandringAvAar } = props;
  const maksAar = new Date().getFullYear() - 1;
  const minimumAar = maksAar - 6;
  const [selectedYear, setSelectedYear] = useState<number>(maksAar);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    onForandringAvAar(year);
  };

  const muligeAar: number[] = Array.from({ length: maksAar - minimumAar + 1 }, (_, index) => maksAar - index);

  return (
    <HStack align="center" gap="4">
      År:
      <Select
        hideLabel
        label="År:"
        data-testid="aarVelger"
        value={selectedYear}
        onChange={handleChange}
        onBlur={handleChange}
      >
        {muligeAar.map((aar) => (
          <option key={aar} value={aar}>
            {aar}
          </option>
        ))}
      </Select>
    </HStack>
  );
}

export default AarVelger;
