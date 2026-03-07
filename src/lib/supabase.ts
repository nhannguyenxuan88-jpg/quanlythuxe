import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function mapDbToCar(dbCar: any): any {
    return {
        id: dbCar.id,
        plate: dbCar.plate,
        brand: dbCar.brand,
        model: dbCar.model,
        year: dbCar.year,
        status: dbCar.status,
        pricePerDay: dbCar.price_per_day,
        image: dbCar.image,
        type: dbCar.type,
        color: dbCar.color,
        engineNumber: dbCar.engine_number,
        frameNumber: dbCar.frame_number,
        seats: dbCar.seats,
        ownerName: dbCar.owner_name,
        ownerAddress: dbCar.owner_address,
        inspectionNumber: dbCar.inspection_number,
        inspectionProvider: dbCar.inspection_provider,
        inspectionDate: dbCar.inspection_date,
    };
}

export function mapCarToDb(car: any): any {
    const dbCar: any = { ...car };
    if (car.pricePerDay !== undefined) { dbCar.price_per_day = car.pricePerDay; delete dbCar.pricePerDay; }
    if (car.engineNumber !== undefined) { dbCar.engine_number = car.engineNumber; delete dbCar.engineNumber; }
    if (car.frameNumber !== undefined) { dbCar.frame_number = car.frameNumber; delete dbCar.frameNumber; }
    if (car.ownerName !== undefined) { dbCar.owner_name = car.ownerName; delete dbCar.ownerName; }
    if (car.ownerAddress !== undefined) { dbCar.owner_address = car.ownerAddress; delete dbCar.ownerAddress; }
    if (car.inspectionNumber !== undefined) { dbCar.inspection_number = car.inspectionNumber; delete dbCar.inspectionNumber; }
    if (car.inspectionProvider !== undefined) { dbCar.inspection_provider = car.inspectionProvider; delete dbCar.inspectionProvider; }
    if (car.inspectionDate !== undefined) { dbCar.inspection_date = car.inspectionDate; delete dbCar.inspectionDate; }
    return dbCar;
}

export function mapDbToBooking(dbBooking: any): any {
    return {
        id: dbBooking.id,
        carId: dbBooking.car_id,
        customerName: dbBooking.customer_name,
        customerPhone: dbBooking.customer_phone,
        customerYearOfBirth: dbBooking.customer_year_of_birth,
        customerCCCD: dbBooking.customer_cccd,
        customerCccdDate: dbBooking.customer_cccd_date,
        customerCccdPlace: dbBooking.customer_cccd_place,
        customerAddress: dbBooking.customer_address,
        startDate: dbBooking.start_date,
        endDate: dbBooking.end_date,
        totalAmount: dbBooking.total_amount,
        status: dbBooking.status,
        customerIdFront: dbBooking.customer_id_front,
        customerIdBack: dbBooking.customer_id_back,
        contractUrl: dbBooking.contract_url,
    };
}

export function mapBookingToDb(booking: any): any {
    const dbBooking: any = { ...booking };
    if (booking.carId !== undefined) { dbBooking.car_id = booking.carId; delete dbBooking.carId; }
    if (booking.customerName !== undefined) { dbBooking.customer_name = booking.customerName; delete dbBooking.customerName; }
    if (booking.customerPhone !== undefined) { dbBooking.customer_phone = booking.customerPhone; delete dbBooking.customerPhone; }
    if (booking.customerYearOfBirth !== undefined) { dbBooking.customer_year_of_birth = booking.customerYearOfBirth; delete dbBooking.customerYearOfBirth; }
    if (booking.customerCCCD !== undefined) { dbBooking.customer_cccd = booking.customerCCCD; delete dbBooking.customerCCCD; }
    if (booking.customerCccdDate !== undefined) { dbBooking.customer_cccd_date = booking.customerCccdDate; delete dbBooking.customerCccdDate; }
    if (booking.customerCccdPlace !== undefined) { dbBooking.customer_cccd_place = booking.customerCccdPlace; delete dbBooking.customerCccdPlace; }
    if (booking.customerAddress !== undefined) { dbBooking.customer_address = booking.customerAddress; delete dbBooking.customerAddress; }
    if (booking.startDate !== undefined) { dbBooking.start_date = booking.startDate; delete dbBooking.startDate; }
    if (booking.endDate !== undefined) { dbBooking.end_date = booking.endDate; delete dbBooking.endDate; }
    if (booking.totalAmount !== undefined) { dbBooking.total_amount = booking.totalAmount; delete dbBooking.totalAmount; }
    if (booking.customerIdFront !== undefined) { dbBooking.customer_id_front = booking.customerIdFront; delete dbBooking.customerIdFront; }
    if (booking.customerIdBack !== undefined) { dbBooking.customer_id_back = booking.customerIdBack; delete dbBooking.customerIdBack; }
    if (booking.contractUrl !== undefined) { dbBooking.contract_url = booking.contractUrl; delete dbBooking.contractUrl; }
    return dbBooking;
}
