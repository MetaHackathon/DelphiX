import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PaperProcessResponse {
  success: boolean;
  message: string;
  paper?: Record<string, any>; // Adjust when you know full shape
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

  // ------------ Basic validations -------------
  if (!(file instanceof File) || !file.name) {
    return json({ success: false, error: "Please select a PDF file to upload." } as const, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) { // 50 MB
    return json({ success: false, error: "File size exceeds 50 MB limit." } as const, { status: 400 });
  }

  if (year && typeof year === "string" && !/^[0-9]{4}$/.test(year)) {
    return json({ success: false, error: "Year must be a 4-digit number." } as const, { status: 400 });
  }

  // ------------- Build form data for backend -------------
  const backendFormData = new FormData();
  backendFormData.append("file", file, file.name);
  if (title) backendFormData.append("title", title.toString());
  if (authors) backendFormData.append("authors", authors.toString());
  if (abstract) backendFormData.append("abstract", abstract.toString());
  if (year) backendFormData.append("year", year.toString());
  if (topics) backendFormData.append("topics", topics.toString());
  backendFormData.append("source", "upload");

  // ------------- Make request to FastAPI backend -------------
  try {
    const resp = await fetch("http://localhost:8000/api/library/upload", {
      method: "POST",
      body: backendFormData,
      // TODO: If authentication is re-enabled, add Authorization header here.
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
// Component (client-side)
// ---------------------------------------------------------------------------
export default function UploadPage() {
  // Selected file + immediate client-side validation
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [yearValue, setYearValue] = useState("");

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isUploading = navigation.state === "submitting";

  // When server response arrives, reset file so user can re-upload easily
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file && file.size > 50 * 1024 * 1024) {
      setFileError("File size exceeds 50 MB limit");
    } else {
      setFileError(null);
    }
  };

  const handleYearChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value;
    // Allow empty or 4 digits only
    if (val === "" || /^[0-9]{0,4}$/.test(val)) {
      setYearValue(val);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <UploadCloud className="h-6 w-6" />
            Upload Paper
          </CardTitle>
          <CardDescription className="text-white/60">
            Provide a PDF and optional metadata. The server will analyze it and return a preview.
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            {/* Optional metadata inputs */}
            <Input name="title" placeholder="Title (optional)" className="text-white placeholder:text-white/40 bg-white/[0.05] border-white/[0.1]" />
            <Input name="authors" placeholder="Authors (comma separated)" className="text-white placeholder:text-white/40 bg-white/[0.05] border-white/[0.1]" />
            <Textarea
              name="abstract"
              placeholder="Abstract (optional)"
              rows={3}
              className="text-white placeholder:text-white/40 bg-white/[0.05] border-white/[0.1] resize-none"
            />
            <Input
              name="year"
              placeholder="Year (e.g., 2025)"
              value={yearValue}
              onChange={handleYearChange}
              className="text-white placeholder:text-white/40 bg-white/[0.05] border-white/[0.1]"
            />
            <Input name="topics" placeholder="Topics (comma separated)" className="text-white placeholder:text-white/40 bg-white/[0.05] border-white/[0.1]" />

            {/* Submit */}
            <Button
              type="submit"
              disabled={!selectedFile || !!fileError || isUploading}
              className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isUploading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}Upload Paper
            </Button>
          </Form>

          {/* Result feedback */}
          {actionData && "success" in actionData && actionData.success && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-white space-y-2">
              <p className="font-semibold text-green-400">{actionData.message}</p>
              {actionData.paper?.title && <p>Paper: {actionData.paper.title}</p>}
              {actionData.analysis_preview && (
                <p className="text-white/80 whitespace-pre-wrap">{actionData.analysis_preview}</p>
              )}
            </div>
          )}

          {actionData && "success" in actionData && !actionData.success && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <p>{
                'error' in actionData && (actionData as any).error
                  ? (actionData as any).error
                  : 'message' in actionData
                    ? (actionData as any).message
                    : 'Upload failed.'
              }</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 