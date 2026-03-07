import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CarList } from './components/CarList';
import { BookingList } from './components/BookingList';
import { CustomerList } from './components/CustomerList';
import { BottomNav } from './components/BottomNav';
import { initialCars, initialBookings, Car, Booking } from './data/mock';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleAddCar = (car: Omit<Car, 'id'>) => {
    const newCar = { ...car, id: `c${Date.now()}` };
    setCars([...cars, newCar]);
  };

  const handleUpdateCar = (id: string, updatedCar: Partial<Car>) => {
    setCars(cars.map(c => c.id === id ? { ...c, ...updatedCar } : c));
  };

  const handleDeleteCar = (id: string) => {
    setCars(cars.filter(c => c.id !== id));
  };

  const handleAddBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking = { ...booking, id: `b${Date.now()}` };
    setBookings([...bookings, newBooking]);
  };

  const handleUpdateBooking = (id: string, updatedBooking: Partial<Booking>) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, ...updatedBooking } : b));
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard cars={cars} bookings={bookings} />;
      case 'cars':
        return (
          <CarList
            cars={cars}
            onAddCar={handleAddCar}
            onUpdateCar={handleUpdateCar}
            onDeleteCar={handleDeleteCar}
          />
        );
      case 'bookings':
        return (
          <BookingList
            bookings={bookings}
            cars={cars}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        );
      case 'customers':
        return <CustomerList bookings={bookings} />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            Tính năng cài đặt đang được phát triển.
          </div>
        );
      default:
        return <Dashboard cars={cars} bookings={bookings} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      {/* Reduced padding on mobile, added pb-20 to account for bottom nav */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8 md:p-8 print:p-0 print:overflow-visible relative">
        <div className="max-w-7xl mx-auto print:max-w-none">
          {renderContent()}
        </div>
      </main>
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

