import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
    return NextResponse.json({
        cwd: process.cwd(),
        ordersPath: path.resolve(process.cwd(), 'orders.json'),
        env: process.env.NODE_ENV
    });
}
