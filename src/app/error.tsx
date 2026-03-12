'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#D92323',
                    color: 'white',
                    fontFamily: 'system-ui, sans-serif',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Oops! Traffic is High</h1>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Our kitchen is a bit busy right now. Please try refreshing or come back in a moment.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '50px',
                                border: 'none',
                                background: 'white',
                                color: '#D92323',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '50px',
                                border: '1px solid white',
                                background: 'transparent',
                                color: 'white',
                                fontWeight: 'bold',
                                textDecoration: 'none'
                            }}
                        >
                            Back Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
