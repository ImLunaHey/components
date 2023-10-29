export const Radio: React.FC<{ name: string; value: string | number; label: string; defaultChecked?: boolean }> = ({
  name,
  value,
  label,
  defaultChecked = false,
}) => {
  const id = `${name} ${value}`.toLowerCase().replaceAll(' ', '-');
  return (
    <div className="px-2 inline-block">
      <input
        defaultChecked={defaultChecked}
        className="bg-[#1e1a2a] text-[#f8f8f2] p-2 rounded-md mr-2"
        type="radio"
        id={id}
        name={name.toLowerCase().replaceAll(' ', '-')}
        value={value}
      />
      <label className="bg-[#1e1a2a] text-[#f8f8f2] p-2 rounded-md" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
