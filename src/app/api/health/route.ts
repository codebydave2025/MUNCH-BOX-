import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET() {
    const ordersPath = path.join(process.cwd(), 'orders.json');
    try {
        const stats = await fs.stat(ordersPath);
        return NextResponse.json({
            status: 'online',
            currentTime: new Date().toISOString(),
            ordersFileExists: true,
            lastModified: stats.mtime,
            fileSize: stats.size,
            cwd: process.cwd()
        });
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            error: e.message
        });
    }
}
