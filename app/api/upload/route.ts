import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const rawEndpoint = process.env.BUCKET_ENDPOINT || "http://192.168.1.11:8333";
const endpointUrl = rawEndpoint.startsWith('http') 
  ? rawEndpoint 
  : `https://${rawEndpoint}`;

const s3Client = new S3Client({
  region: "us-east-1", // SeaweedFS ignores this but the SDK needs it
  endpoint: endpointUrl,
  forcePathStyle: true, // IMPORTANT: SeaweedFS uses path-style buckets
  credentials: {
    accessKeyId: "any", // Default is empty/any unless you set up config.toml
    secretAccessKey: "any",
  },
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const fileOrUrl = data.get('file') as File | string;

    if (!fileOrUrl) {
      return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
    }

    let buffer: Buffer;
    let contentType: string;
    let fileName: string;
    
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);

    if (typeof fileOrUrl === 'string') {
      // It's a URL (e.g. from Google profile)
      const response = await fetch(fileOrUrl);
      if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = response.headers.get('content-type') || 'image/jpeg';
      fileName = `bantu_avatars/${uniqueId}`;
    } else {
      // It's a File object (e.g. from profile edit upload)
      const bytes = await fileOrUrl.arrayBuffer();
      buffer = Buffer.from(bytes);
      contentType = fileOrUrl.type;
      const ext = fileOrUrl.name.split('.').pop() || 'jpg';
      fileName = `bantu_avatars/${uniqueId}.${ext}`;
    }

    const bucketName = process.env.BUCKET_NAME || "bantu";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct public URL
    // Format for path style: endpoint/bucket/key
    const publicUrl = `${endpointUrl}/${bucketName}/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
