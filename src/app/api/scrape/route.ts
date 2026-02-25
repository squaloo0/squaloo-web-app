import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const command = `yt-dlp --dump-json ${url}`;

  return new Promise<NextResponse>((resolve) => {
    exec(command, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return resolve(NextResponse.json({ error: 'Failed to scrape video data' }, { status: 500 }));
      }

      try {
        const data = JSON.parse(stdout);
        const { title, description, thumbnail } = data;
        return resolve(NextResponse.json({ title, description, thumbnail }));
      } catch (parseError) {
        console.error(`parse error: ${parseError}`);
        return resolve(NextResponse.json({ error: 'Failed to parse video data' }, { status: 500 }));
      }
    });
  });
}
