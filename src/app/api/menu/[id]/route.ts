import { NextResponse } from 'next/server';
import { safeRead, atomicWrite } from '@/lib/storage';
import path from 'path';

const menuFilePath = path.join(process.cwd(), 'menu.json');

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updatedItem = await request.json();
        const menu = await safeRead(menuFilePath);

        const index = menu.findIndex((item: any) => item.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        menu[index] = { ...menu[index], ...updatedItem };
        await atomicWrite(menuFilePath, menu);

        return NextResponse.json(menu[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const menu = await safeRead(menuFilePath);

        const filteredMenu = menu.filter((item: any) => item.id !== id);
        if (filteredMenu.length === menu.length) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await atomicWrite(menuFilePath, filteredMenu);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
