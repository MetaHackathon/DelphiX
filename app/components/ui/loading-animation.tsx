import { Brain, FileText, Network, Sparkles } from "lucide-react";

interface LoadingAnimationProps {
  message?: string;
  type?: "search" | "processing" | "connecting";
}

export function LoadingAnimation({ message = "Processing...", type = "search" }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Main Animation */}
      <div className="relative">
        {type === "search" && (
          <>
            {/* Pulsing Brain */}
            <div className="relative">
              <Brain className="w-16 h-16 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 bg-purple-400/20 rounded-full animate-ping"></div>
            </div>
            
            {/* Orbiting Dots */}
            <div className="absolute inset-0 w-16 h-16">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-orbit-1"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 bg-green-400 rounded-full animate-orbit-2"></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-orbit-3"></div>
              <div className="absolute top-1/2 left-0 w-2 h-2 bg-pink-400 rounded-full animate-orbit-4"></div>
            </div>
          </>
        )}
        
        {type === "processing" && (
          <div className="flex space-x-4">
            <FileText className="w-12 h-12 text-blue-400 animate-bounce" />
            <div className="flex items-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
          </div>
        )}
        
        {type === "connecting" && (
          <div className="relative w-20 h-20">
            <Network className="w-20 h-20 text-green-400 animate-pulse" />
            <div className="absolute inset-0">
              <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-400 animate-twinkle-1" />
              <Sparkles className="absolute bottom-3 left-3 w-3 h-3 text-blue-400 animate-twinkle-2" />
              <Sparkles className="absolute top-1/2 left-1 w-2 h-2 text-pink-400 animate-twinkle-3" />
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-white">{message}</p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
} 