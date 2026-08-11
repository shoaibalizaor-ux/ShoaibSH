import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Short from '@/models/Short';
import Comment from '@/models/Comment';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ short: params.id })
      .populate('author')
      .populate('likes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ short: params.id });

    return NextResponse.json(
      {
        success: true,
        comments: comments.map(c => ({
          id: c._id,
          text: c.text,
          author: {
            id: c.author._id,
            name: c.author.name,
            profileImage: c.author.profileImage,
          },
          likes: c.likes.length,
          createdAt: c.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

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

    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be less than 500 characters' },
        { status: 400 }
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

    const comment = new Comment({
      text: text.trim(),
      author: payload.userId,
      short: params.id,
    });

    await comment.save();

    short.comments.push(comment._id as any);
    await short.save();

    await comment.populate('author');

    return NextResponse.json(
      {
        success: true,
        message: 'Comment added successfully',
        comment: {
          id: comment._id,
          text: comment.text,
          author: {
            id: comment.author._id,
            name: comment.author.name,
            profileImage: comment.author.profileImage,
          },
          likes: 0,
          createdAt: comment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
