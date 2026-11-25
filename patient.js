// =====================================================
// CLINICCARE - PATIENT MANAGEMENT
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    const supabase = window.clinicCareSupabase;

    if (!supabase) {
        alert("Supabase is not configured.");
        return;
    }

    const patientForm = document.getElementById("patientForm");
    const patientTableBody = document.getElementById("patientTableBody");
    const patientFormSection = document.getElementById("patientFormSection");

    const openPatientForm = document.getElementById("openPatientForm");
    const closePatientForm = document.getElementById("closePatientForm");
    const patientSearch = document.getElementById("patientSearch");
    const genderFilter = document.getElementById("genderFilter");
    const exportPatients = document.getElementById("exportPatients");

    let patients = [];

    // =================================================
    // MESSAGE
    // =================================================

    function showMessage(message) {
        alert(message);
    }

    // =================================================
    // FORM
    // =================================================

    function openForm() {
        patientFormSection.hidden = false;
        patientFormSection.scrollIntoView({
            behavior: "smooth"
        });
    }

    function closeForm() {
        patientFormSection.hidden = true;
        patientForm.reset();
        document.getElementById("patientRecordId").value = "";
        document.getElementById("formTitle").textContent = "Register New Patient";
        document.getElementById("savePatient").textContent = "Save Patient";
    }

    openPatientForm?.addEventListener("click", openForm);
    closePatientForm?.addEventListener("click", closeForm);

    // =================================================
    // LOAD PATIENTS
    // =================================================

    async function loadPatients() {

        patientTableBody.innerHTML = `
            <tr>
                <td colspan="7">Loading patient records...</td>
            </tr>
        `;

        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);

            patientTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load patient records.
                    </td>
                </tr>
            `;

            return;
        }

        patients = data || [];

        renderPatients();
        updateStatistics();
    }

    // =================================================
    // AGE CALCULATOR
    // =================================================

    function calculateAge(dateOfBirth) {

        if (!dateOfBirth) return "";

        const dob = new Date(dateOfBirth);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();

        const monthDifference =
            today.getMonth() - dob.getMonth();

        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() < dob.getDate()
            )
        ) {
            age--;
        }

        return age;
    }

    // =================================================
    // RENDER PATIENTS
    // =================================================

    function renderPatients() {

        const search = patientSearch.value.toLowerCase().trim();
        const gender = genderFilter.value;

        const filteredPatients = patients.filter(patient => {

            const name = (
                (patient.first_name || "") + " " +
                (patient.last_name || "")
            ).toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                (patient.patient_number || "").toLowerCase().includes(search) ||
                (patient.phone || "").toLowerCase().includes(search);

            const matchesGender =
                !gender || patient.gender === gender;

            return matchesSearch && matchesGender;
        });

        if (filteredPatients.length === 0) {

            patientTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state compact">
                            <strong>No patients found.</strong>
                            <p>Try another search or register a patient.</p>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        patientTableBody.innerHTML = "";

        filteredPatients.forEach(patient => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(patient.patient_number || "")}</td>
                <td>${escapeHTML((patient.first_name || "") + " " + (patient.last_name || ""))}</td>
                <td>${calculateAge(patient.date_of_birth)}</td>
                <td>${escapeHTML(patient.gender || "")}</td>
                <td>${escapeHTML(patient.phone || "")}</td>
                <td>${escapeHTML(patient.registration_date || "")}</td>
                <td>
                    <button class="btn btn-secondary edit-patient"
                        data-id="${escapeHTML(patient.id)}">
                        Edit
                    </button>
                </td>
            `;

            patientTableBody.appendChild(row);
        });

        // Edit buttons
        document.querySelectorAll(".edit-patient").forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.id;

                const patient = patients.find(p => String(p.id) === String(id));

                if (patient) {
                    editPatient(patient);
                }

            });

        });

    }

    // =================================================
    // HTML ESCAPE
    // =================================================

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, character => {

            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return replacements[character];
        });
    }

    // =================================================
    // STATISTICS
    // =================================================

    function updateStatistics() {

        document.getElementById("totalPatients").textContent =
            patients.length;

        document.getElementById("malePatients").textContent =
            patients.filter(p => p.gender === "Male").length;

        document.getElementById("femalePatients").textContent =
            patients.filter(p => p.gender === "Female").length;

        const today = new Date().toISOString().split("T")[0];

        document.getElementById("todayPatients").textContent =
            patients.filter(p => p.registration_date === today).length;
    }

    // =================================================
    // SAVE PATIENT
    // =================================================

    patientForm.addEventListener("submit", async event => {

        event.preventDefault();

        const saveButton = document.getElementById("savePatient");

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        const id = document.getElementById("patientRecordId").value;

        const patientData = {

            first_name:
                document.getElementById("firstName").value.trim(),

            last_name:
                document.getElementById("lastName").value.trim(),

            date_of_birth:
                document.getElementById("dateOfBirth").value,

            gender:
                document.getElementById("gender").value,

            phone:
                document.getElementById("phone").value.trim(),

            email:
                document.getElementById("email").value.trim() || null,

            address:
                document.getElementById("address").value.trim() || null,

            emergency_contact:
                document.getElementById("emergencyContact").value.trim() || null,

            blood_group:
                document.getElementById("bloodGroup").value || null,

            registration_date:
                document.getElementById("registrationDate").value
        };

        try {

            let result;

            if (id) {

                result = await supabase
                    .from("patients")
                    .update(patientData)
                    .eq("id", id);

            } else {

                result = await supabase
                    .from("patients")
                    .insert(patientData);

            }

            if (result.error) {
                throw result.error;
            }

            showMessage(
                id
                    ? "Patient record updated successfully."
                    : "Patient registered successfully."
            );

            closeForm();
            await loadPatients();

        } catch (error) {

            console.error(error);

            showMessage(
                "Unable to save patient. Check your database table and permissions."
            );

        } finally {

            saveButton.disabled = false;
            saveButton.textContent = id ? "Update Patient" : "Save Patient";
        }

    });

    // =================================================
    // EDIT PATIENT
    // =================================================

    function editPatient(patient) {

        document.getElementById("patientRecordId").value = patient.id;

        document.getElementById("firstName").value =
            patient.first_name || "";

        document.getElementById("lastName").value =
            patient.last_name || "";

        document.getElementById("dateOfBirth").value =
            patient.date_of_birth || "";

        document.getElementById("gender").value =
            patient.gender || "";

        document.getElementById("phone").value =
            patient.phone || "";

        document.getElementById("email").value =
            patient.email || "";

        document.getElementById("address").value =
            patient.address || "";

        document.getElementById("emergencyContact").value =
            patient.emergency_contact || "";

        document.getElementById("bloodGroup").value =
            patient.blood_group || "";

        document.getElementById("registrationDate").value =
            patient.registration_date || "";

        document.getElementById("formTitle").textContent =
            "Edit Patient";

        document.getElementById("savePatient").textContent =
            "Update Patient";

        openForm();
    }

    // =================================================
    // SEARCH & FILTER
    // =================================================

    patientSearch.addEventListener("input", renderPatients);
    genderFilter.addEventListener("change", renderPatients);

    // =================================================
    // CSV EXPORT
    // =================================================

    exportPatients.addEventListener("click", () => {

        if (!patients.length) {
            showMessage("There are no patient records to export.");
            return;
        }

        const headers = [
            "Patient ID",
            "First Name",
            "Last Name",
            "Date of Birth",
            "Gender",
            "Phone",
            "Email",
            "Registration Date"
        ];

        const rows = patients.map(patient => [
            patient.patient_number,
            patient.first_name,
            patient.last_name,
            patient.date_of_birth,
            patient.gender,
            patient.phone,
            patient.email,
            patient.registration_date
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(value => {

                const text = String(value ?? "")
                    .replace(/"/g, '""');

                return `"${text}"`;

            }).join(","))
            .join("\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "cliniccare-patients.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

    });

    // =================================================
    // RESET FORM
    // =================================================

    patientForm.addEventListener("reset", () => {

        setTimeout(() => {

            document.getElementById("patientRecordId").value = "";

            document.getElementById("formTitle").textContent =
                "Register New Patient";

            document.getElementById("savePatient").textContent =
                "Save Patient";

        }, 0);

    });

    // =================================================
    // INITIAL LOAD
    // =================================================

    const today = new Date().toISOString().split("T")[0];

    document.getElementById("registrationDate").value = today;

    await loadPatients();

});
