"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (isSignUp) {
            // Create Account
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                setError(error.message);
            } else {
                setMessage("Check your email for a confirmation link!");
            }
        } else {
            // Sign In
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                // Hard navigation so middleware + server component runs fresh
                window.location.href = "/";
            }
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>
                    {isSignUp ? "Create your account" : "Sign in to Draft-Layer"}
                </h1>

                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.success}>{message}</div>}

                <form onSubmit={handleEmailAuth} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email address</label>
                        <input
                            style={styles.input}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.primaryBtn,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading
                            ? "Please wait..."
                            : isSignUp
                                ? "Create Account"
                                : "Sign In"}
                    </button>
                </form>

                <div style={styles.divider}>
                    <span style={styles.dividerText}>or</span>
                </div>

                <button onClick={handleGoogle} style={styles.googleBtn}>
                    <img
                        src="https://www.google.com/favicon.ico"
                        width="18"
                        height="18"
                        alt="G"
                        style={{ marginRight: "8px" }}
                    />
                    Continue with Google
                </button>

                <p style={styles.toggle}>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                        style={styles.toggleLink}
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError("");
                            setMessage("");
                        }}
                    >
                        {isSignUp ? "Sign In" : "Create Account"}
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    title: {
        margin: "0 0 24px 0",
        fontSize: "22px",
        fontWeight: 700,
        color: "#0f172a",
        textAlign: "center",
    },
    error: {
        padding: "10px 14px",
        marginBottom: "16px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#dc2626",
        fontSize: "13px",
    },
    success: {
        padding: "10px 14px",
        marginBottom: "16px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        color: "#16a34a",
        fontSize: "13px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
    },
    input: {
        padding: "10px 14px",
        fontSize: "14px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    primaryBtn: {
        padding: "12px",
        fontSize: "14px",
        fontWeight: 600,
        border: "none",
        borderRadius: "8px",
        background: "#3b82f6",
        color: "#fff",
        transition: "background 0.2s",
        marginTop: "4px",
    },
    divider: {
        display: "flex",
        alignItems: "center",
        margin: "20px 0",
        gap: "12px",
    },
    dividerText: {
        flex: "none",
        fontSize: "12px",
        color: "#9ca3af",
        background: "#fff",
        padding: "0 8px",
    },
    googleBtn: {
        width: "100%",
        padding: "11px",
        fontSize: "14px",
        fontWeight: 500,
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background: "#fff",
        color: "#374151",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
    },
    toggle: {
        marginTop: "20px",
        textAlign: "center",
        fontSize: "13px",
        color: "#6b7280",
    },
    toggleLink: {
        color: "#3b82f6",
        fontWeight: 600,
        cursor: "pointer",
    },
};
