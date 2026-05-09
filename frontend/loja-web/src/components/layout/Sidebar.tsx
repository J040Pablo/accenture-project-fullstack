import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  FileText,
  User
} from 'lucide-react';
import { cn } from '../../utils';
import Logo from '../../assets/Logo.png';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Clientes', path: '/clientes', icon: Users },
  { name: 'Produtos', path: '/produtos', icon: Package },
  { name: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
  { name: 'Contas', path: '/contas', icon: CreditCard },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const activeIndex = navItems.findIndex((item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(item.path);
  });

  return (
    <aside
      className={cn(
        'bg-black flex flex-col transition-[width] duration-300 ease-in-out relative z-20 py-4',
        isHovered ? 'w-52' : 'w-16'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Area */}
      <div
        className={cn(
          'flex items-center px-3 mb-8 transition-all duration-300',
          isHovered ? 'justify-center gap-2' : 'justify-center'
        )}
      >
        {isHovered && (
          <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap">
            Logo
          </span>
        )}

        <div
  className={cn(
    'w-12 h-12 flex items-center justify-center transform transition-transform duration-500 cursor-pointer',
    isHovered ? 'rotate-180' : 'rotate-0'
  )}
>
  <img
    src={Logo}
    alt="Logo"
    className="w-11 h-11 object-contain select-none pointer-events-none"
    draggable={false}
  />
</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-2 relative">
        {/* Fundo roxo animado */}
        {activeIndex !== -1 && (
          <div
            className={cn(
              'absolute top-0 h-10 rounded-full bg-[#a100ff] shadow-lg shadow-[#a100ff]/40 transition-[transform,width,left] duration-300 ease-out',
              isHovered ? 'left-2 w-[calc(100%-1rem)]' : 'left-3 w-10'
            )}
            style={{
              transform: `translateY(${activeIndex * 48}px)`
            }}
          />
        )}

        <div className="relative z-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center transition-all duration-300 h-10 relative',
                  isHovered
                    ? 'w-full rounded-full px-3 gap-3'
                    : 'w-10 mx-auto rounded-full justify-center',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-all duration-300',
                      isActive ? 'text-white scale-110' : 'text-slate-400'
                    )}
                  />

                  {isHovered && (
                    <span
                      className={cn(
                        'font-medium whitespace-nowrap text-sm transition-colors duration-300',
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile Area */}
      <div className="mt-auto px-2 pt-4">
        <div
          className={cn(
            'flex items-center h-10 rounded-full transition-all duration-300 overflow-hidden',
            isHovered
              ? 'justify-start px-2 gap-2 bg-[#111111]'
              : 'justify-center px-0'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>

          <span
            className={cn(
              'text-white font-medium text-sm truncate whitespace-nowrap transition-all duration-300 overflow-hidden',
              isHovered
                ? 'opacity-100 translate-x-0 max-w-32'
                : 'opacity-0 -translate-x-2 max-w-0'
            )}
          >
            Hello, UserName
          </span>
        </div>
      </div>
    </aside>
  );
};