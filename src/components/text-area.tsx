export const TextArea: React.FC<{
  id: string;
  name: string;
  placeholder?: string;
  readOnly?: boolean;
  value?: string | number;
  rows?: number;
}> = ({ placeholder, id, name, value, readOnly = false, rows = 3 }) => (
  <textarea
    className="bg-[#1e1a2a] text-[#f8f8f2] p-2 rounded-md w-full min-h-[100px]"
    name={name}
    id={id}
    placeholder={placeholder}
    readOnly={readOnly}
    value={value}
    rows={rows}
  ></textarea>
);
