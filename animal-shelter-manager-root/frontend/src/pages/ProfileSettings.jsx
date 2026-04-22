import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProfileSettings() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [form, setForm] = useState({
        fname: "",
        lname: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // =========================
    // HANDLE INPUT
    // =========================
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // =========================
    // VALIDATION
    // =========================
    const isValid = () => {
        if (!form.fname || !form.lname || !form.currentPassword) return false;

        if (form.newPassword || form.confirmPassword) {
            if (form.newPassword !== form.confirmPassword) return false;
        }

        return true;
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async () => {
        const res = await fetch("/api/users/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                fname: form.fname,
                lname: form.lname,
                currentPassword: form.currentPassword,
                newPassword: form.newPassword || null,
            }),
        });

        const data = await res.json();

        setIsError(!res.ok);
        setMessage(data.message || data.error);

        if (res.ok) {
            setTimeout(() => navigate("/dashboard"), 1500);
        }
    };

    useEffect(() => {
        fetch("/api/users/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setForm((prev) => ({
                    ...prev,
                    fname: data.fname || "",
                    lname: data.lname || "",
                }));
            })
            .catch(console.error);
    }, []);



    return (
        <div className="manager-card">
            <h2 className="manager-title">Update Profile</h2>

            {message && (
                <div className={`status-message ${isError ? "error" : "success"}`}>
                    {message}
                </div>
            )}

            <div className="form-container">

                <label className="input-label">First Name</label>
                <input
                    name="fname"
                    value={form.fname}
                    onChange={handleChange}
                    className="custom-input"
                />

                <label className="input-label">Last Name</label>
                <input
                    name="lname"
                    value={form.lname}
                    onChange={handleChange}
                    className="custom-input"
                />

                <label className="input-label">Current Password</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="custom-input"
                />

                <label className="input-label">New Password (optional)</label>
                <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="custom-input"
                />

                <label className="input-label">Confirm New Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="custom-input"
                />

            </div>

            <div className="button-group">
                <button
                    className="btn btn-create"
                    onClick={handleSubmit}
                    disabled={!isValid()}
                >
                    Save Changes
                </button>

                <button
                    className="btn btn-delete"
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}