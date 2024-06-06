import { useState } from "react";

interface YearSelectorProps {
  onYearChange: (year: number) => void;
}

const AarVelger: React.FC<YearSelectorProps> = ({ onYearChange }) => {
  const maksAar = new Date().getFullYear() - 1;
  const minimumAar = maksAar - 6;
  const [selectedYear, setSelectedYear] = useState<number>(maksAar);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    onYearChange(year);
  };

  const muligeAar: number[] = Array.from({ length: maksAar - minimumAar + 1 }, (_, index) => maksAar - index);

  return (
    <div>
      År:
      <select
        data-testid="aarVelger"
        value={selectedYear}
        onChange={handleChange}
        onBlur={handleChange}
        style={{
          marginLeft: "1rem",
          padding: "0.5rem 3rem 0.5rem 0.5rem",
          borderRadius: "0.25rem",
          border: "1px solid #ccc",
          background: "#fff",
        }}
      >
        {muligeAar.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AarVelger;
