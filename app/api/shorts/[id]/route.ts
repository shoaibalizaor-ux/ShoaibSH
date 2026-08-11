import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Short from '@/models/Short';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const short = await Short.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('creator').populate({
      path: 'comments',
      populate: { path: 'author' },
    }).populate('likes');

    if (!short) {
      return NextResponse.json(
        { error: 'Short not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        short: {
          id: short._id,
          title: short.title,
          description: short.description,
          videoUrl: short.videoUrl,
          thumbnailUrl: short.thumbnailUrl,
          creator: {
            id: short.creator._id,
            name: short.creator.name,
            profileImage: short.creator.profileImage,
          },
          genre: short.genre,
          anime: short.anime,
          artist: short.artist,
          views: short.views,
          likes: short.likes.length,
          comments: short.comments.length,
          duration: short.duration,
          createdAt: short.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get short error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch short' },
      { status: 500 }
    );
  }
}
