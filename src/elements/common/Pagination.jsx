import PropTypes from "prop-types";
import {
  IconlyArrowLeft,
  IconlyArrowRight,
} from "@/elements/ui/icons/IconlyIcons";

const ELLIPSIS = "ellipsis";

const createPageItems = (currentPage, pageCount) => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, ELLIPSIS, pageCount];
  }

  if (currentPage >= pageCount - 3) {
    return [
      1,
      ELLIPSIS,
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ];
  }

  return [
    1,
    ELLIPSIS,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    ELLIPSIS,
    pageCount,
  ];
};

const Pagination = ({
  first = 0,
  rows = 10,
  totalRecords = 0,
  rowsPerPageOptions = [],
  onPageChange,
  className = "",
  ariaLabel = "Pagination",
}) => {
  const safeRows = Math.max(1, rows);
  const pageCount = Math.ceil(totalRecords / safeRows);
  const currentPage = Math.min(
    Math.max(1, Math.floor(first / safeRows) + 1),
    Math.max(1, pageCount)
  );
  const pageItems = createPageItems(currentPage, pageCount);
  const showRowsSelector =
    rowsPerPageOptions.length > 0 &&
    totalRecords > Math.min(...rowsPerPageOptions);

  if (pageCount <= 1 && !showRowsSelector) return null;

  const emitPageChange = (nextPage, nextRows, originalEvent) => {
    onPageChange?.({
      originalEvent,
      first: (nextPage - 1) * nextRows,
      rows: nextRows,
      page: nextPage - 1,
      pageCount: Math.ceil(totalRecords / nextRows),
    });
  };

  const goToPage = (page, event) => {
    if (page < 1 || page > pageCount || page === currentPage) return;
    emitPageChange(page, safeRows, event);
  };

  return (
    <nav
      className={`bgsnl-pagination ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {pageCount > 1 && (
        <div className="bgsnl-pagination__pages">
          <button
            type="button"
            className="bgsnl-pagination__arrow"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={(event) => goToPage(currentPage - 1, event)}
          >
            <IconlyArrowLeft size={20} aria-hidden />
          </button>

          {pageItems.map((item, index) =>
            item === ELLIPSIS ? (
              <span
                key={`ellipsis-${index}`}
                className="bgsnl-pagination__ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className="bgsnl-pagination__page"
                aria-label={`Go to page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
                onClick={(event) => goToPage(item, event)}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="bgsnl-pagination__arrow"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={(event) => goToPage(currentPage + 1, event)}
          >
            <IconlyArrowRight size={20} aria-hidden />
          </button>
        </div>
      )}

      {showRowsSelector && (
        <label className="bgsnl-pagination__rows">
          <span className="bgsnl-pagination__rows-label">Items per page</span>
          <select
            aria-label="Items per page"
            value={safeRows}
            onChange={(event) =>
              emitPageChange(1, Number(event.target.value), event)
            }
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
};

Pagination.propTypes = {
  first: PropTypes.number,
  rows: PropTypes.number,
  totalRecords: PropTypes.number,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  onPageChange: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Pagination;
