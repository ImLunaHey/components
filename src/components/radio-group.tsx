import { Radio } from './radio';

export const RadioGroup: React.FC<{
  name: string;
  options: { value: string | number; label: string }[];
}> = ({ name, options }) => {
  return (
    <div className="flex flex-row">
      {options.map((option) => (
        <Radio key={name + option.value} name={name} value={option.value} label={option.label} />
      ))}
    </div>
  );
};
