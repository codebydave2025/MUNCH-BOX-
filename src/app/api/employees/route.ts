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

export async function GET() {
    const employees = await getEmployees();
    return NextResponse.json(employees);
}

export async function POST(request: Request) {
    try {
        const newEmp = await request.json();
        const employees = await getEmployees();

        if (!newEmp.id) {
            newEmp.id = `EMP-${Date.now()}`;
        }

        employees.push(newEmp);
        await fs.writeFile(filePath, JSON.stringify(employees, null, 2));

        return NextResponse.json(newEmp);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
