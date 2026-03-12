import { NextResponse } from 'next/server';
import { safeRead } from '@/lib/storage';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Special check for hardcoded admin
        if (email.toLowerCase() === 'admin@munchbox.com' && password === 'munchbox123') {
            return NextResponse.json({
                success: true,
                isAdmin: true,
                user: { name: 'Admin', email: 'admin@munchbox.com' }
            });
        }

        const users = await safeRead(usersFilePath);
        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Don't return the password
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
