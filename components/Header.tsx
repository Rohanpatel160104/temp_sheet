
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 000-2H3zm3 2a1 1 0 011-1h8a1 1 0 110 2H7a1 1 0 01-1-1zm-1 4a1 1 0 001 1h8a1 1 0 100-2H7a1 1 0 00-1 1zm1 3a1 1 0 110 2h8a1 1 0 110-2H7z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Temp Sheet
                </h1>
            </div>
        </header>
    );
};

export default Header;
