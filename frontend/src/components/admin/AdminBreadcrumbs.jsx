import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

const AdminBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <nav className="mb-6 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
      <ol className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/65 bg-white/78 px-4 py-3 shadow-sm">
        <li>
          <div className="flex items-center">
            <Link to="/admin" className="text-secondary-brown/45 hover:text-accent-gold transition-colors">
              <HomeIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pathnames.slice(1).map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
          const isLast = index === pathnames.length - 2;

          return (
            <li key={name}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-secondary-brown/25" aria-hidden="true" />
                <Link
                  to={routeTo}
                  className={`ml-2 text-[11px] font-medium capitalize tracking-[0.02em] transition-colors ${
                    isLast
                      ? 'text-black cursor-default'
                      : 'text-secondary-brown/55 hover:text-secondary-brown'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {name.replace(/-/g, ' ')}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumbs;
