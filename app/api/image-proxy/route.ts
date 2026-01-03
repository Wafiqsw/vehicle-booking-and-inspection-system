import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        // Fetch the image from Firebase Storage (server-side, no CORS issues)
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64 = `data:${blob.type};base64,${buffer.toString('base64')}`;

        return NextResponse.json({ base64 });
    } catch (error) {
        console.error('Error in image proxy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
