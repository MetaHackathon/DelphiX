import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UploadCloud, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import { AuthGuard } from "~/components/auth-guard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PaperProcessResponse {
  success: boolean;
  message: string;
  paper?: Record<string, any>; // Adjust when backend shape is finalized
  analysis_preview: string | null;
  processing_time: number;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
export const meta: MetaFunction = () => [
  { title: "Upload Paper - DelphiX" },
  { name: "description", content: "Upload a PDF to analyze with DataEngineX" },
];

// ---------------------------------------------------------------------------
// Action (server-side)
// ---------------------------------------------------------------------------
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const file = formData.get("file");
  const title = formData.get("title");
  const authors = formData.get("authors");
  const abstract = formData.get("abstract");
  const year = formData.get("year");
  const topics = formData.get("topics");

  // -------- Basic validations --------
  if (!(file instanceof File) || !file.name) {
    return json({ success: false, error: "Please select a PDF file to upload." } as const, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return json({ success: false, error: "File size exceeds 50 MB limit." } as const, { status: 400 });
  }
  if (year && typeof year === "string" && year.length > 0 && !/^[0-9]{4}$/.test(year)) {
    return json({ success: false, error: "Year must be a 4-digit number." } as const, { status: 400 });
  }

  // Build backend form-data
  const backendForm = new FormData();
  backendForm.append("file", file, file.name);
  if (title) backendForm.append("title", title.toString());
  if (authors) backendForm.append("authors", authors.toString());
  if (abstract) backendForm.append("abstract", abstract.toString());
  if (year) backendForm.append("year", year.toString());
  if (topics) backendForm.append("topics", topics.toString());

  try {
    const resp = await fetch("http://localhost:8000/api/library/upload", {
      method: "POST",
      body: backendForm,
      // TODO: add Authorization header when backend requires auth
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Backend error: ${resp.status} ${resp.statusText} – ${text}`);
    }

    const data: PaperProcessResponse = await resp.json();
    return json(data);
  } catch (err) {
    console.error("Upload error:", err);
    return json({ success: false, error: err instanceof Error ? err.message : "Unknown error" } as const, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function PaperUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isUploading = navigation.state === "submitting";

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);

    if (f && f.size > 50 * 1024 * 1024) {
      setFileError("File size exceeds 50 MB limit");
    } else {
      setFileError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <UploadCloud className="h-6 w-6" /> Upload Paper
          </CardTitle>
          <CardDescription className="text-white/60">
            Provide a PDF and optional metadata. The server will analyze it and return a preview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Back to dashboard button */}
          <div className="mb-4">
            <Button asChild variant="ghost" className="text-white/60 hover:text-white">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Link>
            </Button>
          </div>

          <Form method="post" encType="multipart/form-data" className="space-y-6">
            {/* File picker */}
            <div>
              <label
                htmlFor="file"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  "border-white/20 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.05]",
                  fileError && "border-red-400"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <UploadCloud className="w-10 h-10 mb-3 text-white/40" />
                  {selectedFile ? (
                    <p className="text-sm text-white/80">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-white/60">
                      <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                  )}
                  <p className="text-xs text-white/50">PDF (MAX 50 MB)</p>
                </div>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  required
                  onChange={handleFileChange}
                />
              </label>
              {fileError && <p className="text-xs mt-1 text-red-400">{fileError}</p>}
            </div>

            {/* No metadata inputs (option A UI) */}

            {/* Submit */}
            <Button
              type="submit"
              disabled={!selectedFile || !!fileError || isUploading}
              className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isUploading && <Loader2 className="animate-spin h-4 w-4 mr-2" />} Upload Paper
            </Button>
          </Form>

          {/* Feedback */}
          {actionData && "success" in actionData && actionData.success && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-white space-y-2">
              <p className="font-semibold text-green-400">{actionData.message}</p>
              {actionData.paper?.title && <p>Paper: {actionData.paper.title}</p>}
              {actionData.analysis_preview && <p className="text-white/80 whitespace-pre-wrap">{actionData.analysis_preview}</p>}
            </div>
          )}

          {actionData && "success" in actionData && !actionData.success && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <p>{
                "error" in actionData && (actionData as any).error
                  ? (actionData as any).error
                  : "message" in actionData
                  ? (actionData as any).message
                  : "Upload failed."
              }</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap with AuthGuard
export default function PaperUploadRoute() {
  return (
    <AuthGuard>
      <PaperUploadPage />
    </AuthGuard>
  );
} 