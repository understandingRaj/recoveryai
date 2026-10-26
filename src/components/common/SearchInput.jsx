import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...', onClear }) {
  return (
    <div className="search-box">
      <Search size={16} />
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center'
          }}
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
