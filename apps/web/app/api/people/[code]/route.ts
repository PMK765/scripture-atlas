import { NextResponse } from "next/server";
import { getPersonByCode } from "@/lib/people-queries";

export const revalidate = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const person = await getPersonByCode(code);
  if (!person) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }
  return NextResponse.json(person);
}
