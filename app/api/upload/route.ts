import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from "fs";

const pump = promisify(pipeline)

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
    
    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const filename = file.name.replaceAll(" ", "_");
    const filePath = path.join(process.cwd(), `public/assets/${filename}`);

    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await pump(file.stream(), fs.createWriteStream(filePath));
        return NextResponse.json({ path: filePath, status: 200 });
    } catch (err) {
        return NextResponse.json({ Message: (err as Error).message, status: 400 });
    }
};
