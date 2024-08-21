import { prisma } from 'lib/database/prisma';
import { NextRequest } from 'next/server';

export async function GET() {
    const mnestixConnections = await prisma.mnestixConnection.findMany()
    
    return Response.json(mnestixConnections);
}

export async function POST(req: NextRequest) {
    const mnestixConnectionRequest = await req.json()
    
    if (!mnestixConnectionRequest.url || !mnestixConnectionRequest.type) {
        return Response.json({ error: "Url and type are required" });
    }

    try {
        const mnestixType = await prisma.mnestixType.findFirst({where: {typeName: mnestixConnectionRequest.type}})
        if (!mnestixType) {
            return Response.json({error: "Invalid type"})
        }
        await prisma.mnestixConnection.create({
            data: {
                url: mnestixConnectionRequest.url,
                typeId: mnestixType.id
            }
        })
        return Response.json({ message: 'MnestixConnection created' });
    } catch (error) {
        return Response.json({ error: (error as Error).message });
    }
}
