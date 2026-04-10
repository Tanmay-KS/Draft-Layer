'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

const styles: Record<string, React.CSSProperties> = {
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    logo: {
        fontWeight: 700,
        fontSize: '16px',
        color: '#0f172a',
        letterSpacing: '-0.3px',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '13px',
        flexShrink: 0,
    },
    email: {
        fontSize: '13px',
        color: '#374151',
        maxWidth: '180px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    logoutBtn: {
        padding: '5px 12px',
        fontSize: '13px',
        fontWeight: 500,
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        background: '#fff',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
};

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/auth';
    };

    const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?';

    return (
        <header style={styles.header}>
            <span style={styles.logo}>Draft-Layer</span>

            <div style={styles.right}>
                {user ? (
                    <>
                        <div style={styles.avatar}>{avatarLetter}</div>
                        <span style={styles.email}>{user.email}</span>
                        <button
                            style={styles.logoutBtn}
                            onClick={handleLogout}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                        >
                            Logout
                        </button>
                    </>
                ) : null}
            </div>
        </header>
    );
}
