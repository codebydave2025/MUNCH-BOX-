import { NextResponse } from 'next/server';
import path from 'path';
import { safeRead, atomicUpdate } from '@/lib/storage';

const ordersFilePath = path.join(process.cwd(), 'orders.json');

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const { status } = await request.json();
    console.log(`[API PUT] Updating order ${orderId} to ${status}`);

    const result = await atomicUpdate(ordersFilePath, (orders: any[]) => {
      const orderIndex = orders.findIndex((order: any) => order.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
      }
      return orders;
    });

    const updatedOrder = result.find((order: any) => order.id === orderId);

    if (!updatedOrder) {
      console.warn(`[API PUT] Order ${orderId} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`[API PUT] Order ${orderId} updated successfully`);

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('[API PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const orders = await safeRead(ordersFilePath);
    const order = orders.find((order: any) => order.id === orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[API GET ID] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}