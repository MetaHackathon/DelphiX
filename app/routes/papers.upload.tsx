import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { AuthGuard } from "~/components/auth-guard";

export const meta: MetaFunction = () => {
  return [
    { title: "Upload Paper - DelphiX" },
    { name: "description", content: "Upload a new research paper to your library" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const paperFile = formData.get("paperUpload");

  if (paperFile instanceof File && paperFile.name && paperFile.size > 0) {
    console.log("File Name:", paperFile.name);
    console.log("File Size:", paperFile.size);
    console.log("File Type:", paperFile.type);
    // Here you would typically handle the file, e.g., save to a storage, process, etc.
    // For now, just returning a success message.
    return json({ success: true, fileName: paperFile.name, fileSize: paperFile.size } as const);
  } else if (paperFile instanceof File && paperFile.size === 0) {
    return json({ success: false, error: "The selected file is empty. Please select a valid file." } as const, { status: 400 });
  } else {
    return json({ success: false, error: "No file selected or invalid file." } as const, { status: 400 });
  }
  // Potentially redirect after successful upload
  // return redirect("/library");
}

function PaperUploadPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost" className="text-white/60 hover:text-white">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-lg bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20">
            <UploadCloud className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Upload New Paper</CardTitle>
          <CardDescription className="text-white/60">
            Select a PDF or other supported document from your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" encType="multipart/form-data" className="space-y-6">
            <div>
              <label
                htmlFor="paperUpload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-white/20 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-white/40" />
                  <p className="mb-2 text-sm text-white/60">
                    <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-white/50">PDF, DOCX, TXT (MAX. 50MB)</p>
                </div>
                <input id="paperUpload" name="paperUpload" type="file" className="hidden" />
              </label>
            </div>
            
            {actionData && 'error' in actionData && actionData.error && (
              <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md">
                {actionData.error}
              </p>
            )}
            {actionData && 'success' in actionData && actionData.success && (
              <p className="text-sm text-green-400 bg-green-500/10 p-3 rounded-md">
                Successfully uploaded: {actionData.fileName} ({ (actionData.fileSize / (1024*1024)).toFixed(2) } MB)
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload Paper
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaperUploadRoute() {
  return (
    <AuthGuard>
      <PaperUploadPage />
    </AuthGuard>
  );
} 