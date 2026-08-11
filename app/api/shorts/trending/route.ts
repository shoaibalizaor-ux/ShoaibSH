import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Short from '@/models/Short';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const shortsSinceYesterday = new Date();
    shortsSinceYesterday.setDate(shortsSinceYesterday.getDate() - 1);

    const trendingShorts = await Short.find({
      isPublished: true,
      createdAt: { $gte: shortsSinceYesterday },
    })
      .populate('creator')
      .sort({ views: -1, likes: -1 })
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        shorts: trendingShorts.map(s => ({
          id: s._id,
          title: s.title,
          thumbnailUrl: s.thumbnailUrl,
          creator: {
            id: s.creator._id,
            name: s.creator.name,
          },
          views: s.views,
          likes: s.likes.length,
          genre: s.genre,
          anime: s.anime,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get trending error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending shorts' },
      { status: 500 }
    );
  }
}
