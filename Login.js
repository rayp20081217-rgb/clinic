// ============================================
// CLINICCARE LOGIN SYSTEM
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    const supabase = window.clinicCareSupabase;
    const loginForm = document.getElementById("loginForm");

    if (!supabase) {
        console.error("Supabase connection not found.");
        return;
    }

    if (!loginForm) {
        console.error("Login form not found.");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const button = loginForm.querySelector('button[type="submit"]');

        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Signing in...";

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Verify the staff profile exists
            const { data: staff, error: staffError } = await supabase
                .from("staff")
                .select("id, full_name, role")
                .eq("id", data.user.id)
                .single();

            if (staffError || !staff) {
                await supabase.auth.signOut();
                throw new Error("Your account has no staff profile. Contact the clinic administrator.");
            }

            // Redirect after successful login
            window.location.href = "dashboard.html";

        } catch (error) {
            alert(error.message || "Login failed.");
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
});
