"use strict";

/* =================================
   CLINICCARE SUPABASE CONNECTION
================================= */

(() => {

    const SUPABASE_URL =
        "https://psgvwctbtgbtcglwkzic.supabase.co";

    const SUPABASE_KEY =
        "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

    if (window.clinicCareSupabase) {
        return;
    }

    if (!window.supabase) {
        console.error(
            "Supabase library not loaded."
        );
        return;
    }

    if (SUPABASE_KEY.includes("PASTE_")) {
        console.error(
            "Please configure your Supabase publishable key."
        );
        return;
    }

    window.clinicCareSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );

    console.log(
        "ClinicCare Supabase initialized."
    );

})();
