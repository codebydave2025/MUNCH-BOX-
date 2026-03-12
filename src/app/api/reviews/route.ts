import { NextResponse } from 'next/server';
import path from 'path';
import { safeRead, atomicWrite } from '@/lib/storage';

const reviewsFilePath = path.join(process.cwd(), 'reviews.json');

export async function GET() {
    const reviews = await safeRead(reviewsFilePath);
    return NextResponse.json(reviews);
}

export async function POST(request: Request) {
    try {
        const newReview = await request.json();
        const reviews = await safeRead(reviewsFilePath);

        newReview.id = `rev-${Date.now()}`;
        newReview.date = new Date().toISOString();

        reviews.unshift(newReview);
        await atomicWrite(reviewsFilePath, reviews);

        return NextResponse.json(newReview);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
