import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Comment from '@/models/Comment';
import Short from '@/models/Short';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function DELETE(
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

    if (comment.author.toString() !== payload.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(params.commentId);

    await Short.findByIdAndUpdate(
      params.id,
      { $pull: { comments: params.commentId } }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Comment deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
