import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileText, Users, Calendar, Star, ArrowLeft } from "lucide-react";
import { apiClient } from "~/lib/api";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string | null;
  year?: number;
  citations?: number;
  pdf_url: string;
  processing_status?: string;
  _originalData?: any;
}

export const meta: MetaFunction = () => [
  { title: "Document Library - DelphiX" },
  { name: "description", content: "Browse your uploaded and saved PDFs" },
];

export async function loader({}: LoaderFunctionArgs) {
  try {
    const papers = await apiClient.getLibrary() as Paper[];
    return json({ papers } as const);
  } catch (err) {
    console.error("Library load error", err);
    return json({ papers: [] } as const, { status: 200 });
  }
}

export default function DocumentLibrary() {
  const { papers } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");

  const filtered = (papers || []).filter((p) =>
    p?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030303] pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your Documents</h1>
          <Button asChild variant="ghost" className="text-white/60 hover:text-white">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2"/>Back</Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filtered as Paper[]).map((paper) => (
            <Link
              key={paper.id}
              to={`/document/${paper._originalData?.arxiv_id || paper.id}`}
              state={{ paper }}
              prefetch="intent"
            >
              <Card className="bg-white/[0.03] hover:bg-white/[0.05] border-white/[0.07] transition-colors h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium line-clamp-2 mb-1">
                        {paper.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{paper.authors && paper.authors.slice(0,2).join(", ")}{paper.authors && paper.authors.length>2?` +${paper.authors.length-2}`:""}</span>
                        </div>
                        {paper.year ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{paper.year}</span>
                          </div>
                        ) : null}
                        {paper.citations ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{paper.citations.toLocaleString()}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-white/60 col-span-full text-center">No documents found.</p>
          )}
        </div>
      </div>
    </div>
  );
} 