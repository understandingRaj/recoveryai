import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
        gap: 12
      }}
    >
      <div>
        Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalItems}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 8px' }}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                fontWeight: currentPage === page ? 600 : 400
              }}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 8px' }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
