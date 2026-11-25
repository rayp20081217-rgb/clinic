// ============================================
// CLINICCARE SUPABASE CONNECTION
// ============================================

const SUPABASE_URL = "https://psgvwctbtgbtcglwkzic.supabase.co";

const SUPABASE_KEY = "sb_publishable_QbYmXwnmkGmKGOlZHPTEXw_sxHYb-VJ";

// Initialize Supabase
window.clinicCareSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
