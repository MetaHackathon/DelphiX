import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Link } from "@remix-run/react";
import { Search, ArrowRight, FileText, Network, MessageCircle, Sparkles, TrendingUp, Users, BookOpen, Zap, ChevronRight, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "DataEngineX - AI Research Discovery Platform" },
    { name: "description", content: "Discover, analyze, and connect research papers with AI-powered insights" },
  ];
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      // Navigate to knowledge canvas with demo results
      window.location.href = '/knowledge-canvas';
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const trendingPapers = [
    {
      title: "Attention Is All You Need",
      authors: "Vaswani et al.",
      category: "Deep Learning",
      citations: "50k+",
      year: "2017"
    },
    {
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin et al.",
      category: "NLP",
      citations: "35k+",
      year: "2018"
    },
    {
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: "Brown et al.",
      category: "Language Models",
      citations: "30k+",
      year: "2020"
    }
  ];

  const features = [
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Search through millions of research papers with AI-powered semantic understanding"
    },
    {
      icon: Network,
      title: "Knowledge Canvas",
      description: "Visualize connections between papers and explore research landscapes interactively"
    },
    {
      icon: MessageCircle,
      title: "Paper Agents",
      description: "Chat with AI assistants that have deep understanding of specific research papers"
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description: "Get automated summaries, key findings, and research implications instantly"
    }
  ];

  const stats = [
    { value: "2M+", label: "Research Papers" },
    { value: "500K+", label: "Researchers" },
    { value: "50K+", label: "Institutions" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">DataEngineX</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Docs
              </Button>
              <Button variant="outline">Sign In</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Research
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Discovery Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover, analyze, and connect research papers with advanced AI. 
              Transform how you explore academic literature and accelerate your research.
            </p>

            {/* Search Interface */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search papers, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 pr-32 py-4 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-6"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <>Search</>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
                <span>Try:</span>
                <button 
                  onClick={() => setSearchQuery("attention mechanism")}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  attention mechanism
                </button>
                <button 
                  onClick={() => setSearchQuery("transformer architecture")}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  transformer architecture
                </button>
                <button 
                  onClick={() => setSearchQuery("BERT")}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  BERT
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <Link to="/knowledge-canvas">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                  Explore Knowledge Canvas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of research discovery with our cutting-edge AI capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Papers Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Research</h2>
              <p className="text-lg text-gray-600">Discover the most impactful papers in your field</p>
            </div>
            <Button variant="outline" className="flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingPapers.map((paper, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {paper.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Star className="w-3 h-3" />
                      <span>{paper.citations}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {paper.authors} • {paper.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Citations: {paper.citations}</span>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to accelerate your research?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of researchers already using DataEngineX to discover breakthrough insights
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">DataEngineX</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI-powered research discovery platform for the modern researcher.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 DataEngineX. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Zap className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
