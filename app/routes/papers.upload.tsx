import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { 
  UploadCloud, 
  Loader2, 
  ArrowLeft, 
  FileText, 
  Check, 
  AlertCircle, 
  Plus,
  X,
  Sparkles,
  BookOpen,
  Users,
  Calendar,
  Tag
} from "lucide-react";
import { cn } from "~/lib/utils";
import { AuthGuard, useAuth } from "~/components/auth-guard";
import { apiClient } from "~/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PaperProcessResponse {
  success: boolean;
  message: string;
  paper?: {
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    year: number;
    topics: string[];
  };
  analysis_preview: string | null;
  processing_time: number;
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  paper_count: number;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
export const meta: MetaFunction = () => [
  { title: "Upload Paper - DelphiX" },
  { name: "description", content: "Upload and analyze research papers with AI" },
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
  const knowledgeBaseIds = formData.get("knowledgeBaseIds");

  if (!(file instanceof File) || !file.name) {
    return json({ success: false, error: "Please select a PDF file to upload." } as const, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return json({ success: false, error: "File size exceeds 50 MB limit." } as const, { status: 400 });
  }
  if (year && typeof year === "string" && year.length > 0 && !/^[0-9]{4}$/.test(year)) {
    return json({ success: false, error: "Year must be a 4-digit number." } as const, { status: 400 });
  }

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
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Backend error: ${resp.status} ${resp.statusText} – ${text}`);
    }

    const data: PaperProcessResponse = await resp.json();
    
    if (data.success && data.paper && knowledgeBaseIds) {
      try {
        const kbIds = JSON.parse(knowledgeBaseIds.toString());
        if (Array.isArray(kbIds) && kbIds.length > 0) {
          for (const kbId of kbIds) {
            await fetch(`http://localhost:8000/api/knowledge-bases/${kbId}/papers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paper_ids: [data.paper.id] }),
            });
          }
        }
      } catch (kbError) {
        console.error("Error adding paper to knowledge bases:", kbError);
      }
    }
    
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
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKBs, setSelectedKBs] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [yearValue, setYearValue] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [authorsValue, setAuthorsValue] = useState("");
  const [abstractValue, setAbstractValue] = useState("");
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isUploading = navigation.state === "submitting";

  useEffect(() => {
    const loadKnowledgeBases = async () => {
      if (!user) return;
      try {
        const response = await apiClient.getKnowledgebases();
        if (Array.isArray(response)) {
          setKnowledgeBases(response);
        }
      } catch (error) {
        console.error("Error loading knowledge bases:", error);
      }
    };
    loadKnowledgeBases();
  }, [user]);

  const extractMetadataFromPDF = async (file: File) => {
    setIsExtractingMetadata(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("http://localhost:8000/api/extract-metadata", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const metadata = await response.json();
        if (metadata.title) setTitleValue(metadata.title);
        if (metadata.authors) setAuthorsValue(Array.isArray(metadata.authors) ? metadata.authors.join(", ") : metadata.authors);
        if (metadata.year) setYearValue(metadata.year.toString());
        if (metadata.abstract) setAbstractValue(metadata.abstract);
        if (metadata.topics && Array.isArray(metadata.topics)) setTopics(metadata.topics);
      }
    } catch (error) {
      console.error("Failed to extract metadata:", error);
      // Continue without auto-filling
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);
    if (file && file.size > 50 * 1024 * 1024) {
      setFileError("File size exceeds 50 MB limit");
    } else {
      setFileError(null);
      if (file) {
        setCurrentStep(2);
        // Extract metadata from PDF
        await extractMetadataFromPDF(file);
      }
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    handleFileSelect(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        handleFileSelect(file);
      } else {
        setFileError("Please select a PDF file");
      }
    }
  };

  const addTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput("");
    }
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

      return (
      <div className="h-screen bg-[#030303] flex flex-col overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0.02))]" />
        
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between p-6 pt-24 flex-shrink-0"
          >
            <Button asChild variant="ghost" className="text-white/60 hover:text-white">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 text-white/40">
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentStep >= 1 ? "bg-white" : "bg-white/20"
              )} />
              <div className="w-8 h-px bg-white/20" />
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentStep >= 2 ? "bg-white" : "bg-white/20"
              )} />
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex items-start justify-center flex-1 px-6 pb-6 overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-2xl h-full flex flex-col"
          >
            {/* Title */}
            <motion.div variants={itemVariants} className="text-center mb-6 flex-shrink-0">
              <h1 className="text-3xl font-bold text-white mb-3">
                Upload Research Paper
              </h1>
              <p className="text-white/60">
                Add your research to the knowledge base with AI-powered analysis
              </p>
            </motion.div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <Form method="post" encType="multipart/form-data" className="flex-1 flex flex-col min-h-0">
              {/* Step 1: File Upload */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-8"
                  >
                    <div
                      className={cn(
                        "relative border border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group",
                        isDragging 
                          ? "border-white/40 bg-white/[0.02]" 
                          : "border-white/20 hover:border-white/30 hover:bg-white/[0.01]",
                        fileError && "border-red-400/50 bg-red-500/[0.02]"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <label htmlFor="file" className="cursor-pointer block">
                        <motion.div
                          animate={{ 
                            scale: isDragging ? 1.05 : 1,
                            rotate: isDragging ? 1 : 0 
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          {selectedFile ? (
                            <div className="space-y-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto"
                              >
                                <FileText className="h-8 w-8 text-green-400" />
                              </motion.div>
                              <div>
                                <p className="text-white font-medium text-lg">{selectedFile.name}</p>
                                <p className="text-white/60">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="w-20 h-20 bg-white/[0.05] rounded-2xl flex items-center justify-center mx-auto group-hover:bg-white/[0.08] transition-colors">
                                <UploadCloud className="h-10 w-10 text-white/60" />
                              </div>
                              <div>
                                <p className="text-xl text-white mb-2">
                                  Drop your PDF here, or{" "}
                                  <span className="text-white/80 underline underline-offset-4">browse</span>
                                </p>
                                <p className="text-white/50">
                                  Supports files up to 50 MB
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </label>
                      <input
                        id="file"
                        name="file"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        required
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    {fileError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-red-400 bg-red-500/10 rounded-xl p-4"
                      >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{fileError}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Metadata */}
                {currentStep === 2 && selectedFile && (
                  <motion.div
                    key="step2"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: 50 }}
                    className="flex-1 flex flex-col space-y-4"
                  >
                    {/* File Preview */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4 flex-shrink-0"
                    >
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-white/60 text-sm">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          {isExtractingMetadata && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Extracting metadata...
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setCurrentStep(1);
                        }}
                        className="text-white/60 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>

                    {/* Metadata Fields */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants}>
                          <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                            <BookOpen className="h-4 w-4" />
                            Title
                          </label>
                          <Input
                            name="title"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            placeholder="Paper title"
                            className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.04]"
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                            <Calendar className="h-4 w-4" />
                            Year
                          </label>
                          <Input
                            name="year"
                            value={yearValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^[0-9]{0,4}$/.test(val)) {
                                setYearValue(val);
                              }
                            }}
                            placeholder="2024"
                            className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.04]"
                          />
                        </motion.div>
                      </div>

                      <motion.div variants={itemVariants}>
                        <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                          <Users className="h-4 w-4" />
                          Authors
                        </label>
                        <Input
                          name="authors"
                          value={authorsValue}
                          onChange={(e) => setAuthorsValue(e.target.value)}
                          placeholder="Author 1, Author 2, Author 3"
                          className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.04]"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                          <Tag className="h-4 w-4" />
                          Topics
                        </label>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={topicInput}
                              onChange={(e) => setTopicInput(e.target.value)}
                              onKeyDown={handleTopicKeyDown}
                              placeholder="Add a topic"
                              className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.04]"
                            />
                            <Button
                              type="button"
                              onClick={addTopic}
                              size="sm"
                              variant="outline"
                              className="border-white/[0.08] text-white/80 hover:bg-white/[0.05]"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {topics.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-wrap gap-2"
                            >
                              {topics.map((topic, index) => (
                                <motion.div
                                  key={topic}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  layout
                                >
                                  <Badge
                                    variant="secondary"
                                    className="bg-white/[0.08] text-white/80 border-white/[0.1] flex items-center gap-1"
                                  >
                                    {topic}
                                    <button
                                      type="button"
                                      onClick={() => removeTopic(index)}
                                      className="ml-1 hover:text-red-400"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                          <input type="hidden" name="topics" value={topics.join(",")} />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="text-white/80 text-sm font-medium mb-3 block">
                          Abstract
                        </label>
                        <Textarea
                          name="abstract"
                          value={abstractValue}
                          onChange={(e) => setAbstractValue(e.target.value)}
                          placeholder="Paper abstract..."
                          rows={4}
                          className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.04] resize-none"
                        />
                      </motion.div>

                      {/* Knowledge Base Selection */}
                      {knowledgeBases.length > 0 && (
                        <motion.div variants={itemVariants}>
                          <label className="text-white/80 text-sm font-medium mb-4 block">
                            Add to Knowledge Base (optional)
                          </label>
                                                     <div className="grid gap-2 max-h-32 overflow-y-auto">
                            {knowledgeBases.map((kb) => (
                              <motion.label
                                key={kb.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
                                  selectedKBs.includes(kb.id)
                                    ? "bg-white/[0.05] border border-white/[0.1]"
                                    : "bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03]"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedKBs.includes(kb.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedKBs([...selectedKBs, kb.id]);
                                    } else {
                                      setSelectedKBs(selectedKBs.filter(id => id !== kb.id));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div className={cn(
                                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                  selectedKBs.includes(kb.id)
                                    ? "bg-white border-white"
                                    : "border-white/30"
                                )}>
                                  {selectedKBs.includes(kb.id) && (
                                    <Check className="h-3 w-3 text-black" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-medium">{kb.name}</p>
                                  <p className="text-white/60 text-sm">{kb.paper_count} papers</p>
                                </div>
                              </motion.label>
                            ))}
                          </div>
                          <input type="hidden" name="knowledgeBaseIds" value={JSON.stringify(selectedKBs)} />
                        </motion.div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants} className="pt-4 flex-shrink-0 border-t border-white/[0.05]">
                      <Button
                        type="submit"
                        disabled={isUploading}
                        className="w-full h-12 bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 transition-all duration-200"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5 mr-3" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-3" />
                            Upload & Analyze
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              </Form>
            </div>

            {/* Results */}
            <AnimatePresence>
              {actionData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8"
                >
                  {actionData.success ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-green-400 font-medium">Upload successful!</p>
                          <p className="text-white/60 text-sm">Your paper has been processed</p>
                        </div>
                      </div>
                      {actionData.paper && (
                        <p className="text-white/80 mb-4">{actionData.paper.title}</p>
                      )}
                      <div className="flex gap-3">
                        <Button size="sm" asChild className="bg-white text-black hover:bg-white/90">
                          <Link to="/document">View Library</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="border-white/[0.1] text-white/80">
                          <Link to="/dashboard">Dashboard</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-red-400 font-medium">Upload failed</p>
                          <p className="text-red-300/80 text-sm">
                            {"error" in actionData ? (actionData as any).error : "Unknown error"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
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