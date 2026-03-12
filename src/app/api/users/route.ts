import { NextResponse } from 'next/server';
import { safeRead } from '@/lib/storage';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');

export async function GET() {
    try {
        const users = await safeRead(usersFilePath);
        // Remove passwords before sending to admin
        const usersWithoutPasswords = users.map(({ password, ...rest }: any) => rest);
        return NextResponse.json(usersWithoutPasswords);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
