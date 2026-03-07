import { Car, LayoutDashboard, CalendarDays, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function Sidebar({ currentView, onViewChange, userEmail, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'cars', label: 'Quản lý xe', icon: Car },
    { id: 'bookings', label: 'Đơn thuê', icon: CalendarDays },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const displayName = userEmail?.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex-col h-screen shrink-0 print:hidden hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Car className="text-indigo-500" />
          AutoRent
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                isActive
                  ? "bg-indigo-600 text-white font-medium"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-medium text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
