import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Short from '@/models/Short';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const genre = (formData.get('genre') as string)?.split(',') || [];
    const anime = formData.get('anime') as string;
    const artist = formData.get('artist') as string;

    if (!videoFile || !title) {
      return NextResponse.json(
        { error: 'Video file and title are required' },
        { status: 400 }
      );
    }

    if (videoFile.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video file size must be less than 100MB' },
        { status: 400 }
      );
    }

    await connectDB();

    const videoBuffer = await videoFile.arrayBuffer();
    const videoUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'shoaibsh/videos',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(Buffer.from(videoBuffer));
    });

    let thumbnailUrl = null;

    if (thumbnailFile) {
      const thumbnailBuffer = await thumbnailFile.arrayBuffer();
      const thumbnailUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'shoaibsh/thumbnails',
            width: 400,
            height: 225,
            crop: 'fill',
            quality: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(Buffer.from(thumbnailBuffer));
      });
      thumbnailUrl = (thumbnailUpload as any).secure_url;
    }

    const short = new Short({
      title,
      description,
      videoUrl: (videoUpload as any).secure_url,
      thumbnailUrl,
      creator: payload.userId,
      genre,
      anime,
      artist,
      duration: (videoUpload as any).duration || 0,
      isPublished: true,
    });

    await short.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Video uploaded successfully',
        short: {
          id: short._id,
          title: short.title,
          videoUrl: short.videoUrl,
          thumbnailUrl: short.thumbnailUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
