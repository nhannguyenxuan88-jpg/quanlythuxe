import { Car, LayoutDashboard, CalendarDays, Users, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
    const navItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'cars', label: 'Xe', icon: Car },
        { id: 'bookings', label: 'Đơn thuê', icon: CalendarDays },
        { id: 'customers', label: 'Khách', icon: Users },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-2 pt-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)] flex justify-between items-center z-50 print:hidden">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors",
                            isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        <div className={cn(
                            "p-1 rounded-xl transition-all",
                            isActive ? "bg-indigo-50" : ""
                        )}>
                            <Icon size={22} className={isActive ? "stroke-2" : "stroke-[1.5]"} />
                        </div>
                        <span className={cn(
                            "text-[10px] sm:text-xs font-medium",
                            isActive ? "text-indigo-600 font-semibold" : ""
                        )}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
