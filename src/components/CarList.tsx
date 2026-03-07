import { useState } from 'react';
import { Car as CarType, CarStatus } from '../data/mock';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { CarForm } from './CarForm';

interface CarListProps {
  cars: CarType[];
  onAddCar: (car: Omit<CarType, 'id'>) => void;
  onUpdateCar: (id: string, car: Partial<CarType>) => void;
  onDeleteCar: (id: string) => void;
}

export function CarList({ cars, onAddCar, onUpdateCar, onDeleteCar }: CarListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CarStatus | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: CarStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rented': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'maintenance': return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const getStatusLabel = (status: CarStatus) => {
    switch (status) {
      case 'available': return 'Sẵn sàng';
      case 'rented': return 'Đang thuê';
      case 'maintenance': return 'Bảo dưỡng';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý xe</h2>
          <p className="text-slate-500 mt-1">Danh sách đội xe tự lái của bạn</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Thêm xe mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo biển số, hãng, dòng xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CarStatus | 'all')}
              className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Sẵn sàng</option>
              <option value="rented">Đang thuê</option>
              <option value="maintenance">Bảo dưỡng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Xe</th>
                <th className="p-4 font-medium">Biển số</th>
                <th className="p-4 font-medium">Năm SX</th>
                <th className="p-4 font-medium">Giá thuê/ngày</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{car.brand} {car.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-sm border border-slate-200">
                      {car.plate}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{car.year}</td>
                  <td className="p-4 font-medium text-slate-900">{formatCurrency(car.pricePerDay)}</td>
                  <td className="p-4">
                    <select
                      value={car.status}
                      onChange={(e) => onUpdateCar(car.id, { status: e.target.value as CarStatus })}
                      className={cn(
                        "appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border focus:ring-2 focus:ring-indigo-500 transition-colors",
                        getStatusColor(car.status)
                      )}
                    >
                      <option value="available" className="bg-white text-slate-900 font-sans">Sẵn sàng</option>
                      <option value="rented" className="bg-white text-slate-900 font-sans">Đang thuê</option>
                      <option value="maintenance" className="bg-white text-slate-900 font-sans">Bảo dưỡng</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteCar(car.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Không tìm thấy xe nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {filteredCars.map((car) => (
              <div key={car.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900 truncate">{car.brand} {car.model}</h3>
                        <p className="text-sm text-slate-500">{car.year}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-800 font-mono text-xs border border-slate-200 bg-slate-50">
                        {car.plate}
                      </span>
                    </div>
                    <p className="font-medium text-indigo-600 mt-2">{formatCurrency(car.pricePerDay)}/ngày</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <select
                    value={car.status}
                    onChange={(e) => onUpdateCar(car.id, { status: e.target.value as CarStatus })}
                    className={cn(
                      "appearance-none cursor-pointer outline-none inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border focus:ring-2 focus:ring-indigo-500 transition-colors",
                      getStatusColor(car.status)
                    )}
                  >
                    <option value="available" className="bg-white text-slate-900 font-sans">Sẵn sàng</option>
                    <option value="rented" className="bg-white text-slate-900 font-sans">Đang thuê</option>
                    <option value="maintenance" className="bg-white text-slate-900 font-sans">Bảo dưỡng</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDeleteCar(car.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredCars.length === 0 && (
              <div className="text-center p-8 text-slate-500">
                Không tìm thấy xe nào phù hợp.
              </div>
            )}
          </div>
        </div>
      </div>

      <CarForm
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onSubmit={car => {
          onAddCar(car);
          setIsAdding(false);
        }}
      />
    </div>
  );
}
