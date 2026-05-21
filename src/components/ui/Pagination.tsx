import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    if (totalPages <= 1) return null;

    // Lógica para mostrar siempre la primera, la última, y las cercanas a la actual
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    return (
        <div className="bg-white px-4 md:px-6 py-4 border-t border-[#c8d8f0]/60 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            {/* Información del total */}
            <div className="text-sm font-medium text-[#1e3a6e] text-center sm:text-left">
                {totalItems !== undefined && itemsPerPage !== undefined && totalItems > 0 ? (
                    <>
                        Mostrando <span className="font-bold text-[#0a1628]">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                        <span className="font-bold text-[#0a1628]">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de{' '}
                        <span className="font-bold text-[#0a1628]">{totalItems}</span> resultados
                    </>
                ) : (
                    <>
                        Página <span className="font-bold text-[#0a1628]">{currentPage}</span> de <span className="font-bold text-[#0a1628]">{totalPages}</span>
                    </>
                )}
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 px-3 md:px-4 rounded-xl border-2 border-[#c8d8f0]/60 text-[#0a1628] hover:bg-[#d4af37]/5 hover:border-[#d4af37] disabled:opacity-30 disabled:hover:border-[#c8d8f0]/60 disabled:hover:bg-transparent transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-1 md:gap-2 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="hidden sm:flex gap-1 md:gap-2 mx-1 md:mx-2">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="text-[#6b8cba] self-end pb-2 font-black tracking-tighter px-1">
                                    ...
                                </span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-xl font-black transition-all border-2 text-sm flex items-center justify-center ${
                                        currentPage === page
                                            ? 'bg-[#d4af37] border-[#d4af37] text-white shadow-md transform -translate-y-0.5'
                                            : 'bg-white border-[#c8d8f0]/60 text-[#1e3a6e] hover:border-[#d4af37] hover:bg-[#d4af37]/5'
                                    }`}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex sm:hidden items-center justify-center min-w-[3rem] font-bold text-sm text-[#0a1628]">
                    {currentPage}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 px-3 md:px-4 rounded-xl border-2 border-[#c8d8f0]/60 text-[#0a1628] hover:bg-[#d4af37]/5 hover:border-[#d4af37] disabled:opacity-30 disabled:hover:border-[#c8d8f0]/60 disabled:hover:bg-transparent transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-1 md:gap-2 shadow-sm"
                >
                    <span className="hidden sm:inline">Siguiente</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
