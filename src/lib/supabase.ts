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
        customerLicenseClass: dbBooking.customer_license_class,
        customerLicenseNumber: dbBooking.customer_license_number,
        customerLicenseExpiry: dbBooking.customer_license_expiry,
        rentalPurpose: dbBooking.rental_purpose,
        paymentMethod: dbBooking.payment_method,
        paymentDate: dbBooking.payment_date,
        depositAmount: dbBooking.deposit_amount,
        contractLocation: dbBooking.contract_location,
        startDate: dbBooking.start_date,
        endDate: dbBooking.end_date,
        totalAmount: dbBooking.total_amount,
        status: dbBooking.status,
        customerIdFront: dbBooking.customer_id_front,
        customerIdBack: dbBooking.customer_id_back,
        customerLicenseFront: dbBooking.customer_license_front,
        customerLicenseBack: dbBooking.customer_license_back,
        contractUrl: dbBooking.contract_url,

        checkOutTime: dbBooking.check_out_time,
        checkOutOdo: dbBooking.check_out_odo,
        checkOutFuel: dbBooking.check_out_fuel,
        checkOutNotes: dbBooking.check_out_notes,
        checkOutImages: dbBooking.check_out_images || [],

        checkInTime: dbBooking.check_in_time,
        checkInOdo: dbBooking.check_in_odo,
        checkInFuel: dbBooking.check_in_fuel,
        checkInNotes: dbBooking.check_in_notes,
        checkInImages: dbBooking.check_in_images || [],
    };
}

export function mapBookingToDb(booking: any): any {
    const dbBooking: any = {};
    if (booking.id !== undefined) dbBooking.id = booking.id;
    if (booking.carId !== undefined) dbBooking.car_id = booking.carId;
    if (booking.customerName !== undefined) dbBooking.customer_name = booking.customerName;
    if (booking.customerPhone !== undefined) dbBooking.customer_phone = booking.customerPhone;
    if (booking.customerYearOfBirth !== undefined) dbBooking.customer_year_of_birth = booking.customerYearOfBirth;
    if (booking.customerCCCD !== undefined) dbBooking.customer_cccd = booking.customerCCCD;
    if (booking.customerCccdDate !== undefined) dbBooking.customer_cccd_date = booking.customerCccdDate;
    if (booking.customerCccdPlace !== undefined) dbBooking.customer_cccd_place = booking.customerCccdPlace;
    if (booking.customerAddress !== undefined) dbBooking.customer_address = booking.customerAddress;
    if (booking.customerLicenseClass !== undefined) dbBooking.customer_license_class = booking.customerLicenseClass;
    if (booking.customerLicenseNumber !== undefined) dbBooking.customer_license_number = booking.customerLicenseNumber;
    if (booking.customerLicenseExpiry !== undefined) dbBooking.customer_license_expiry = booking.customerLicenseExpiry;
    if (booking.rentalPurpose !== undefined) dbBooking.rental_purpose = booking.rentalPurpose;
    if (booking.paymentMethod !== undefined) dbBooking.payment_method = booking.paymentMethod;
    if (booking.paymentDate !== undefined) dbBooking.payment_date = booking.paymentDate;
    if (booking.depositAmount !== undefined) dbBooking.deposit_amount = booking.depositAmount;
    if (booking.contractLocation !== undefined) dbBooking.contract_location = booking.contractLocation;
    if (booking.startDate !== undefined) dbBooking.start_date = booking.startDate;
    if (booking.endDate !== undefined) dbBooking.end_date = booking.endDate;
    if (booking.totalAmount !== undefined) dbBooking.total_amount = booking.totalAmount;
    if (booking.status !== undefined) dbBooking.status = booking.status;

    // Documents
    if (booking.customerIdFront !== undefined) dbBooking.customer_id_front = booking.customerIdFront;
    if (booking.customerIdBack !== undefined) dbBooking.customer_id_back = booking.customerIdBack;
    if (booking.customerLicenseFront !== undefined) dbBooking.customer_license_front = booking.customerLicenseFront;
    if (booking.customerLicenseBack !== undefined) dbBooking.customer_license_back = booking.customerLicenseBack;
    if (booking.contractUrl !== undefined) dbBooking.contract_url = booking.contractUrl;

    // Handover Check-out
    if (booking.checkOutTime !== undefined) dbBooking.check_out_time = booking.checkOutTime;
    if (booking.checkOutOdo !== undefined) dbBooking.check_out_odo = booking.checkOutOdo;
    if (booking.checkOutFuel !== undefined) dbBooking.check_out_fuel = booking.checkOutFuel;
    if (booking.checkOutNotes !== undefined) dbBooking.check_out_notes = booking.checkOutNotes;
    if (booking.checkOutImages !== undefined) dbBooking.check_out_images = booking.checkOutImages;

    // Handover Check-in
    if (booking.checkInTime !== undefined) dbBooking.check_in_time = booking.checkInTime;
    if (booking.checkInOdo !== undefined) dbBooking.check_in_odo = booking.checkInOdo;
    if (booking.checkInFuel !== undefined) dbBooking.check_in_fuel = booking.checkInFuel;
    if (booking.checkInNotes !== undefined) dbBooking.check_in_notes = booking.checkInNotes;
    if (booking.checkInImages !== undefined) dbBooking.check_in_images = booking.checkInImages;

    // Strip blob: URLs (temporary local previews) - they can't be stored and cause errors
    for (const key of Object.keys(dbBooking)) {
        if (typeof dbBooking[key] === 'string' && dbBooking[key].startsWith('blob:')) {
            delete dbBooking[key];
        }
    }

    return dbBooking;
}
