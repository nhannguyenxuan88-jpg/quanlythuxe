import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Testing connection...");

    const { data, error } = await supabase
        .from('bookings')
        .select('id, contract_url, contract_location')
        .limit(1);

    if (error) {
        console.error("Error querying 'contract_url' or 'contract_location':", error);
        console.log("Please run this exact SQL in your Supabase SQL Editor:");
        console.log("NOTIFY pgrst, 'reload schema';");
    } else {
        console.log("Successfully queried 'contract_url' and 'contract_location'!");
        console.log(data);
    }
}

checkSchema();
