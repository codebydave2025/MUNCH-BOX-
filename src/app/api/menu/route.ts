import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { safeRead, atomicWrite } from '@/lib/storage';
import path from 'path';

const menuFilePath = path.join(process.cwd(), 'menu.json');

export async function GET() {
    const menu = await safeRead(menuFilePath);
    return NextResponse.json(menu);
}

export async function POST(request: Request) {
    try {
        const newItem = await request.json();
        const menu = await safeRead(menuFilePath);

        // Generate ID if not provided
        if (!newItem.id) {
            newItem.id = `item-${Date.now()}`;
        }

        menu.push(newItem);
        await atomicWrite(menuFilePath, menu);

        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}
