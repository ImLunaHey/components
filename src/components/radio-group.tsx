import { cn } from '../cn';
import { Radio } from './radio';

export const RadioGroup: React.FC<{
  name: string;
  options: { value: string | number; label: string }[];
  className?: string;
}> = ({ name, options, className }) => {
  return (
    <div className={cn('flex flex-row', className)}>
      {options.map((option) => (
        <Radio key={name + option.value} name={name} value={option.value} label={option.label} />
      ))}
    </div>
  );
};
