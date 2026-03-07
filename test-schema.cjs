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

    // Try to insert a dummy record or just select with the new columns
    const { data, error } = await supabase
        .from('bookings')
        .select('id, contract_url')
        .limit(1);

    if (error) {
        console.error("Error querying 'contract_url':", error);

        // Attempting to forcefully reload schema by making a specific REST call
        console.log("Please run this exact SQL in your Supabase SQL Editor:");
        console.log("NOTIFY pgrst, 'reload schema';");

    } else {
        console.log("Successfully queried 'contract_url'!");
        console.log(data);
    }
}

checkSchema();
