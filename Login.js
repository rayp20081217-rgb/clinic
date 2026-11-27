// ============================================
// LOGIN SYSTEM - SUPABASE
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const supabase = window.clinicCareSupabase;

    if (!supabase) {
        console.error("Supabase is not configured.");
        alert("Connection to Supabase failed.");
        return;
    }

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const errorMessage = document.getElementById("errorMessage");

    // Redirect if already logged in
    checkSession();

    async function checkSession() {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error(error);
            return;
        }

        if (data.session) {
            window.location.href = "dashboard.html";
        }
    }

    // Login
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Please enter your email and password.");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing in...";
        hideError();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                showError(error.message);
                return;
            }

            if (data.user) {
                window.location.href = "dashboard.html";
            }

        } catch (err) {
            console.error(err);
            showError("Something went wrong. Please try again.");
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
        }
    });

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = "block";
        } else {
            alert(message);
        }
    }

    function hideError() {
        if (errorMessage) {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
        }
    }

});
