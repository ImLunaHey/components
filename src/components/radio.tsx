import { cn } from '../cn';

export const Radio: React.FC<{
  name: string;
  value: string | number;
  label: string;
  defaultChecked?: boolean;
  className?: string;
}> = ({ name, value, label, defaultChecked = false, className }) => {
  const id = `${name} ${value}`.toLowerCase().replaceAll(' ', '-');
  return (
    <div className="px-2 inline-block">
      <input
        defaultChecked={defaultChecked}
        className={cn('bg-[#1e1a2a] text-[#f8f8f2] p-2 rounded-md mr-2', className)}
        type="radio"
        id={id}
        name={name.toLowerCase().replaceAll(' ', '-')}
        value={value}
      />
      <label className={cn('bg-[#1e1a2a] text-[#f8f8f2] p-2 rounded-md', className)} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
