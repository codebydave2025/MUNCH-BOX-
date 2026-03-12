export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { safeRead, atomicUpdate } from '@/lib/storage';

const ordersFilePath = path.join(process.cwd(), 'orders.json');

export async function GET() {
  try {
    const orders = await safeRead(ordersFilePath);
    console.log(`[API GET] Returning ${orders.length} orders`);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API GET] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    console.log(`[API POST] Received new order: ${newOrder.id}`);

    await atomicUpdate(ordersFilePath, (orders: any[]) => {
      orders.unshift(newOrder);
      return orders;
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('[API POST] Error:', error.message);
    return NextResponse.json({ error: 'Server Overload' }, { status: 500 });
  }
}