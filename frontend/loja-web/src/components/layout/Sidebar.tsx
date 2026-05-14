import React from 'react';
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
  const [isExpanded, setIsExpanded] = React.useState(true);
  const location = useLocation();

  const activeIndex = navItems.findIndex((item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(item.path);
  });

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-width', '13rem');
    root.style.setProperty('--sidebar-collapsed-width', '4rem');
    root.style.setProperty('--current-sidebar-width', isExpanded ? '13rem' : '4rem');
  }, [isExpanded]);

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn('bg-black flex flex-col relative z-20 py-4 transition-[width] duration-300 ease-in-out', isExpanded ? 'w-52' : 'w-16')}
    >
      {/* Logo Area */}
      <div className={cn('flex items-center px-3 mb-8 transition-all duration-300', isExpanded ? 'justify-center gap-2' : 'justify-center')}>
        {isExpanded && (
          <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap">
            Logo
          </span>
        )}
        <div className={cn('w-12 h-12 flex items-center justify-center transform transition-transform duration-500 cursor-pointer', isExpanded ? 'rotate-180' : 'rotate-0')}>
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
              isExpanded ? 'left-2 w-[calc(100%-1rem)]' : 'left-3 w-10'
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
                  isExpanded
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

                  {isExpanded && (
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
      <div className="mt-auto px-2 pt-4 border-t border-[#1a1a1a]">
        <div
          className={cn(
            'flex items-center h-12 rounded-2xl transition-all duration-300 overflow-hidden',
            isExpanded
              ? 'justify-start px-2 gap-3 bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-inner'
              : 'justify-center px-0'
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg">
            <User className="w-5 h-5 text-slate-300" />
          </div>

          <div className={cn(
            'flex flex-col transition-all duration-300 overflow-hidden',
            isExpanded ? 'opacity-100 max-w-32' : 'opacity-0 max-w-0'
          )}>
            <span className="text-white font-bold text-xs truncate">
              Administrador
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              pablo@accenture.com
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};