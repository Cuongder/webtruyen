import { NextResponse } from "next/server";
import { getPublicGenres } from "@/lib/read-model";

export async function GET() {
  try {
    return NextResponse.json({ success: true, genres: await getPublicGenres() });
  } catch (error) {
    console.error("Genres GET error:", error);
    return NextResponse.json({ error: "Không thể tải thể loại." }, { status: 500 });
  }
}
