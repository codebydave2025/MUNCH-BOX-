import { NextResponse } from 'next/server';
import { safeRead, atomicWrite } from '@/lib/storage';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');

export async function POST(request: Request) {
    try {
        const userData = await request.json();
        const { name, email, phone, password } = userData;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const users = await safeRead(usersFilePath);

        // Check if user already exists
        if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        const newUser = {
            id: `user-${Date.now()}`,
            name,
            email: email.toLowerCase(),
            phone,
            password, // In a real app, hash this!
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await atomicWrite(usersFilePath, users);

        // Don't return the password
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
