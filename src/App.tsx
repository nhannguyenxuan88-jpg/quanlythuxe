import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CarList } from './components/CarList';
import { BookingList } from './components/BookingList';
import { CustomerList } from './components/CustomerList';
import { Settings } from './components/Settings';
import { BottomNav } from './components/BottomNav';
import { LoginPage } from './components/LoginPage';
import { Car, Booking } from './data/mock';
import { supabase, mapDbToCar, mapCarToDb, mapDbToBooking, mapBookingToDb } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [carsRes, bookingsRes] = await Promise.all([
        supabase.from('cars').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false })
      ]);

      if (carsRes.error) throw carsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      const fetchedCars = carsRes.data.map(mapDbToCar);
      const fetchedBookings = bookingsRes.data.map(mapDbToBooking);

      // Auto-correct car statuses based on active bookings
      const activeCarIds = new Set(fetchedBookings.filter(b => b.status === 'active').map(b => b.carId));
      let stateChanged = false;

      const syncedCars = await Promise.all(fetchedCars.map(async (car) => {
        let expectedStatus = car.status;

        if (activeCarIds.has(car.id)) {
          expectedStatus = 'rented';
        } else if (car.status === 'rented') {
          expectedStatus = 'available'; // Revert back to available if no active booking holds it
        }

        if (car.status !== expectedStatus) {
          stateChanged = true;
          await supabase.from('cars').update({ status: expectedStatus }).eq('id', car.id);
          return { ...car, status: expectedStatus };
        }
        return car;
      }));

      setCars(syncedCars);
      setBookings(fetchedBookings);
    } catch (error: any) {
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCar = async (car: Omit<Car, 'id'>) => {
    const loadingToast = toast.loading('Đang thêm xe...');
    try {
      const dbCar = mapCarToDb(car);
      const { data, error } = await supabase.from('cars').insert([dbCar]).select().single();
      if (error) throw error;
      setCars([mapDbToCar(data), ...cars]);
      toast.success('Thêm xe thành công', { id: loadingToast });
    } catch (error: any) {
      toast.error('Lỗi khi thêm xe: ' + error.message, { id: loadingToast });
    }
  };

  const handleUpdateCar = async (id: string, updatedCar: Partial<Car>) => {
    const loadingToast = toast.loading('Đang cập nhật...');
    try {
      const dbUpdates = mapCarToDb(updatedCar);
      dbUpdates.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from('cars').update(dbUpdates).eq('id', id).select().single();
      if (error) throw error;
      setCars(cars.map(c => c.id === id ? mapDbToCar(data) : c));
      toast.success('Cập nhật thành công', { id: loadingToast });
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật: ' + error.message, { id: loadingToast });
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    const loadingToast = toast.loading('Đang xóa xe...');
    try {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') throw new Error('Không thể xóa xe đã có lịch sử thuê');
        throw error;
      }
      setCars(cars.filter(c => c.id !== id));
      toast.success('Xóa xe thành công', { id: loadingToast });
    } catch (error: any) {
      toast.error('Lỗi khi xóa: ' + error.message, { id: loadingToast });
    }
  };

  const handleAddBooking = async (booking: Omit<Booking, 'id'>) => {
    const loadingToast = toast.loading('Đang tạo đơn thuê...');
    try {
      const dbBooking = mapBookingToDb(booking);
      const { data, error } = await supabase.from('bookings').insert([dbBooking]).select().single();
      if (error) throw error;

      // Sync car status if booking is active
      if (booking.status === 'active') {
        const { error: carError } = await supabase.from('cars').update({ status: 'rented' }).eq('id', booking.carId);
        if (!carError) {
          setCars(cars.map(c => c.id === booking.carId ? { ...c, status: 'rented' } : c));
        }
      }

      setBookings([mapDbToBooking(data), ...bookings]);
      toast.success('Tạo đơn thuê thành công', { id: loadingToast });
    } catch (error: any) {
      toast.error('Lỗi khi tạo đơn: ' + error.message, { id: loadingToast });
    }
  };

  const handleUpdateBooking = async (id: string, updatedBooking: Partial<Booking>) => {
    const loadingToast = toast.loading('Đang cập nhật đơn...');
    try {
      const dbUpdates = mapBookingToDb(updatedBooking);
      dbUpdates.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from('bookings').update(dbUpdates).eq('id', id).select().single();
      if (error) throw error;

      // Sync car status on update
      if (updatedBooking.status !== undefined) {
        const existingBooking = bookings.find(b => b.id === id);
        const carId = updatedBooking.carId || existingBooking?.carId;
        if (carId) {
          const newCarStatus = updatedBooking.status === 'active' ? 'rented' : 'available';
          const { error: carError } = await supabase.from('cars').update({ status: newCarStatus }).eq('id', carId);
          if (!carError) {
            setCars(cars.map(c => c.id === carId ? { ...c, status: newCarStatus } : c));
          }
        }
      }

      setBookings(bookings.map(b => b.id === id ? mapDbToBooking(data) : b));
      toast.success('Cập nhật đơn thành công', { id: loadingToast });
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật đơn: ' + error.message, { id: loadingToast });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn thuê này?')) return;
    const loadingToast = toast.loading('Đang xóa đơn...');
    try {
      const existingBooking = bookings.find(b => b.id === id);
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;

      // Ensure car is marked available if the active booking is deleted
      if (existingBooking && existingBooking.carId) {
        const { error: carError } = await supabase.from('cars').update({ status: 'available' }).eq('id', existingBooking.carId);
        if (!carError) {
          setCars(cars.map(c => c.id === existingBooking.carId ? { ...c, status: 'available' } : c));
        }
      }

      setBookings(bookings.filter(b => b.id !== id));
      toast.success('Xóa đơn thành công', { id: loadingToast });
    } catch (error: any) {
      toast.error('Lỗi khi xóa: ' + error.message, { id: loadingToast });
    }
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
        return <CustomerList bookings={bookings} cars={cars} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard cars={cars} bookings={bookings} />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Đã đăng xuất');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
      <Toaster position="top-right" />
      <Sidebar currentView={currentView} onViewChange={setCurrentView} userEmail={session.user.email} onLogout={handleLogout} />
      {/* Reduced padding on mobile, added pb-20 to account for bottom nav */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8 md:p-8 print:block print:p-0 print:overflow-visible relative">
        <div className="max-w-7xl mx-auto print:max-w-none">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

