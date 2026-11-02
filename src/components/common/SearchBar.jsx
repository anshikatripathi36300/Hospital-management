/**
 * SearchBar.jsx — Reusable search input with magnifier icon.
 */
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', id = 'search' }) {
  return (
    <div className="search-bar">
      <span className="search-bar-icon" aria-hidden="true">
        <Search size={15} />
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
