import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  actionButton,
}) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4 mb-6">
      {/* Page Title */}
      <div>
        <h2 className="font-display-sm text-2xl sm:text-3xl font-bold text-on-surface">
          {title}
        </h2>

        <p className="font-body-lg text-sm sm:text-base text-on-surface-variant mt-1">
          {subtitle}
        </p>
      </div>

      {/* Right Side */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        {/* Search */}
        <div className="flex items-center border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-lowest focus-within:border-secondary transition-colors w-full sm:w-64">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">
            search
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records..."
            className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant/50"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-sm">
                close
              </span>
            </button>
          )}
        </div>

        {/* Install App Button (passed from App.tsx) */}
        {actionButton}

        {/* User Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center border border-outline-variant shadow-sm"
          title="Admin User"
        >
          PR
        </div>
      </div>
    </header>
  );
};