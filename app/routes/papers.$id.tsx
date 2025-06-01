import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string | null;
  pdf_url: string;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.paper?.title ?? "Paper Viewer - DelphiX" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) throw new Response("Not found", { status: 404 });

  // Attempt to fetch paper list and find the paper
  try {
    const resp = await fetch("http://localhost:8000/api/library");
    if (!resp.ok) throw new Error(`API error ${resp.status}`);
    const papers: Paper[] = await resp.json();
    const paper = papers.find((p) => p.id === id);
    if (!paper) throw new Response("Not found", { status: 404 });
    return json({ paper } as const);
  } catch (err) {
    console.error("Loader error", err);
    throw new Response("Unable to load paper", { status: 500 });
  }
}

export default function PaperViewer() {
  const { paper } = useLoaderData<typeof loader>();
  const location = useLocation();
  // If navigation state passed a fresher paper, prefer it
  const statePaper = (location.state as any)?.paper as Paper | undefined;
  const displayPaper = statePaper ?? paper;

  const pdfUrl = `http://localhost:8000${displayPaper.pdf_url}`;

  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    setIframeError(false);
  }, [pdfUrl]);

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col">
      <div className="p-4">
        <Button asChild variant="ghost" className="text-white/60 hover:text-white">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 p-4 max-h-[calc(100vh-4rem)]">
        {/* PDF Viewer */}
        <div className="w-full h-full border border-white/[0.1] rounded-lg overflow-hidden">
          {!iframeError ? (
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              className="w-full h-full"
              onError={() => setIframeError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60">
              Unable to load PDF
            </div>
          )}
        </div>

        {/* Metadata Panel */}
        <Card className="bg-white/[0.02] border-white/[0.08] max-h-full overflow-y-auto sticky top-4">
          <CardHeader>
            <CardTitle className="text-white text-lg mb-2">{displayPaper.title}</CardTitle>
            <CardDescription className="text-white/60">
              {displayPaper.authors?.join(", ") || "Unknown authors"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayPaper.abstract ? (
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {displayPaper.abstract}
              </p>
            ) : (
              <p className="text-sm text-white/60">No abstract available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 