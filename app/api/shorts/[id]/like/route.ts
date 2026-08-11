import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Short from '@/models/Short';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const short = await Short.findById(params.id);

    if (!short) {
      return NextResponse.json(
        { error: 'Short not found' },
        { status: 404 }
      );
    }

    const isLiked = short.likes.includes(payload.userId as any);

    if (isLiked) {
      short.likes = short.likes.filter(id => id.toString() !== payload.userId);
    } else {
      short.likes.push(payload.userId as any);
    }

    await short.save();

    return NextResponse.json(
      {
        success: true,
        liked: !isLiked,
        likes: short.likes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Failed to like short' },
      { status: 500 }
    );
  }
}
