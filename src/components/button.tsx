import { PropsWithChildren } from 'react';

export const Button: React.FC<PropsWithChildren> = ({ children }) => (
  <button className="bg-[#f8f8f2] text-[#1e1a2a] p-2 rounded-md" type="submit">
    {children}
  </button>
);
