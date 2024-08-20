import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dbPath = path.resolve(process.cwd(), 'mnestix-database.db');

export async function GET() {
    const db = new Database(dbPath);
    
    const connections = db.prepare("SELECT * FROM Connections").all();
    db.close();
    
    return Response.json(connections);
}

export async function POST(req: NextRequest) {
    const db = new Database(dbPath);
    const body = await req.json()

    console.log(body)
    
    const type = body.type;
    const url = body.url;

    if (!url || !type) {
        return Response.json({ error: "url and type are required" });
    }

    try {
        const stmt = db.prepare("INSERT INTO Connections (url, type) VALUES (?, ?)");
        stmt.run(url, type);
        return Response.json({ message: 'Connection created' });
    } catch (error) {
        return Response.json({ error: (error as Error).message });
    }
}
