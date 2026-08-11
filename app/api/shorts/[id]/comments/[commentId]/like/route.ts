import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Comment from '@/models/Comment';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
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

    const comment = await Comment.findById(params.commentId);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const isLiked = comment.likes.includes(payload.userId as any);

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== payload.userId);
    } else {
      comment.likes.push(payload.userId as any);
    }

    await comment.save();

    return NextResponse.json(
      {
        success: true,
        liked: !isLiked,
        likes: comment.likes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like comment error:', error);
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    );
  }
}
