import useFeatureToggle, { Status } from "./useFeatureToggle";

interface FeatureToggleProps {
  togglename: string;
  children: (toggle: Status) => JSX.Element | null;
}

const FeatureToggle = ({ children, togglename }: FeatureToggleProps) => {
  const [toggle] = useFeatureToggle(togglename);

  return children(toggle);
};

export default FeatureToggle;
