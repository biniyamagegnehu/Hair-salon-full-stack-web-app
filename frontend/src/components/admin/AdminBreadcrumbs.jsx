import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

const AdminBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show on dashboard
  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex mb-6 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        <li>
          <div>
            <Link to="/admin" className="text-secondary-brown/40 hover:text-accent-gold transition-colors">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
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
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-secondary-brown/20" aria-hidden="true" />
                <Link
                  to={routeTo}
                  className={`ml-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isLast 
                      ? 'text-accent-gold cursor-default' 
                      : 'text-secondary-brown/40 hover:text-secondary-brown'
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
