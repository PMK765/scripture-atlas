import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ bookCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BookIndexPage({ params, searchParams }: PageProps) {
  const { bookCode } = await params;
  const search = await searchParams;
  const t = typeof search.t === "string" ? search.t : undefined;
  const qs = t ? `?t=${encodeURIComponent(t)}` : "";
  redirect(`/books/${bookCode}/1${qs}`);
}
