import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "~/components/auth-guard";
import { apiClient } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  ArrowLeft,
  Volume2,
  BookOpen,
  Loader2,
  Play,
  Pause,
  Download
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Podcast Generator - DelphiX" },
    { name: "description", content: "Generate audio versions of your research papers" },
  ];
};

function PodcastContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [recentPapers, setRecentPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) {
      loadRecentPapers();
    }
  }, [user]);

  const loadRecentPapers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      // Get recent papers
      const papersData = await apiClient.getLibrary() as any[];
      setRecentPapers(papersData.slice(0, 10)); // Show last 10 papers
    } catch (error) {
      setError('Failed to load recent papers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPaper) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: selectedPaper.abstract,
          voiceId: "voice1", // Default voice
          stability: 0.5,
          similarity: 0.75,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate audio");
      }

      const { audio } = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${audio}`;
      setAudioUrl(audioUrl);
      
      // Create audio element
      const audioElement = new Audio(audioUrl);
      audioElement.onended = () => setIsPlaying(false);
      setAudioElement(audioElement);
    } catch (error) {
      console.error("Failed to generate audio:", error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl || !selectedPaper) return;
    
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${selectedPaper.title.toLowerCase().replace(/\s+/g, "-")}-podcast.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your recent papers...</p>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
          <Button onClick={loadRecentPapers} variant="outline" className="text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Podcast Generator
              </h1>
              <p className="text-white/60 text-lg">
                Create audio versions of your research papers
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Papers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Papers
                </CardTitle>
                <CardDescription className="text-white/60">
                  Select a paper to generate its podcast version
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPapers.map((paper) => (
                    <Card
                      key={paper.id}
                      className={`bg-white/[0.02] border-white/[0.08] cursor-pointer transition-all hover:bg-white/[0.04] ${
                        selectedPaper?.id === paper.id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      onClick={() => setSelectedPaper(paper)}
                    >
                      <CardContent className="p-4">
                        <h3 className="text-white font-medium mb-2 line-clamp-2">
                          {paper.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-2">
                          {paper.authors?.join(", ")}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-white/[0.1] text-white/60">
                            {paper.year}
                          </Badge>
                          {paper.citations > 0 && (
                            <Badge variant="outline" className="text-xs border-white/[0.1] text-white/60">
                              {paper.citations} citations
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Podcast Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Generate Podcast
                </CardTitle>
                <CardDescription className="text-white/60">
                  {selectedPaper 
                    ? "Configure voice settings and generate the podcast"
                    : "Select a paper from the list to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPaper ? (
                  <div className="space-y-6">
                    {/* Selected Paper Info */}
                    <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.08]">
                      <h4 className="text-white font-medium mb-2">
                        {selectedPaper.title}
                      </h4>
                      <p className="text-white/60 text-sm mb-2">
                        {selectedPaper.authors?.join(", ")}
                      </p>
                      <p className="text-white/60 text-sm">
                        {selectedPaper.year} • {selectedPaper.citations} citations
                      </p>
                    </div>

                    {/* Audio Controls */}
                    {audioUrl && (
                      <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.08]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={togglePlayback}
                          className="text-white hover:bg-white/[0.05]"
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <div className="flex-1">
                          <div className="h-1 bg-white/[0.1] rounded-full">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "0%" }} />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDownload}
                          className="text-white hover:bg-white/[0.05]"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Generate Podcast
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-white/60 py-8">
                    <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p>Select a paper to generate its podcast version</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function PodcastPage() {
  return <PodcastContent />;
} 