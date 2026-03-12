import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'employees.json');

async function getEmployees() {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return [];
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updated = await request.json();
        const employees = await getEmployees();

        const index = employees.findIndex((e: any) => e.id === id);
        if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        employees[index] = { ...employees[index], ...updated };
        await fs.writeFile(filePath, JSON.stringify(employees, null, 2));

        return NextResponse.json(employees[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const employees = await getEmployees();
        const filtered = employees.filter((e: any) => e.id !== id);
        await fs.writeFile(filePath, JSON.stringify(filtered, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
