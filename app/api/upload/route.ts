import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const fileOrUrl = data.get('file') as File | string;

    if (!fileOrUrl) {
      return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
    }

    let uploadData: string;

    if (typeof fileOrUrl === 'string') {
      // It's a URL (e.g. from Google profile)
      uploadData = fileOrUrl;
    } else {
      // It's a File object (e.g. from profile edit upload)
      const bytes = await fileOrUrl.arrayBuffer();
      const buffer = Buffer.from(bytes);
      uploadData = `data:${fileOrUrl.type};base64,${buffer.toString('base64')}`;
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        uploadData,
        {
          folder: 'bantu_avatars',
          transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
