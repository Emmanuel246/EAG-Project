import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import { cloudinaryClient } from "@/lib/cloudinary";

export async function POST(request: Request) {
  if (!cloudinaryClient) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add the required env vars to .env and restart the app.",
      },
      { status: 400 },
    );
  }

  // Capture into a local so the non-null narrowing holds inside the closure below.
  const cloudinary = cloudinaryClient;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "riddim-protocol",
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }

            if (
              !uploadResult ||
              !uploadResult.secure_url ||
              !uploadResult.public_id
            ) {
              reject(new Error("Upload result was empty."));
              return;
            }

            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          },
        );

        const stream = Readable.from(buffer);
        stream.pipe(uploadStream);
      },
    );

    return NextResponse.json({
      message: "Upload successful",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
