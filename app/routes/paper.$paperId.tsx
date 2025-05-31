import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  Download, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Settings,
  FileText,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Copy
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";

export const meta: MetaFunction = () => {
  return [
    { title: "Paper Agent - DataEngineX" },
    { name: "description", content: "AI-powered research assistant for academic papers" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const paperId = params.paperId;
  
  // Demo paper data
  const papers: Record<string, any> = {
    attention: {
      id: "attention",
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
      abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
      year: 2017,
      venue: "NIPS",
      citations: 50000,
      topics: ["transformers", "attention", "neural networks", "nlp"],
      sections: [
        "Abstract",
        "1. Introduction", 
        "2. Background",
        "3. Model Architecture",
        "4. Why Self-Attention",
        "5. Training",
        "6. Results",
        "7. Conclusion"
      ]
    },
    bert: {
      id: "bert",
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
      abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
      year: 2018,
      venue: "NAACL",
      citations: 35000,
      topics: ["bert", "pretraining", "bidirectional", "nlp"],
      sections: [
        "Abstract",
        "1. Introduction",
        "2. Related Work", 
        "3. BERT",
        "4. Experiments",
        "5. Ablation Studies",
        "6. Conclusion"
      ]
    }
  };

  const paper = papers[paperId as string] || papers.attention;
  
  return json({ paper });
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: string[];
}

export default function PaperAgent() {
  const { paper } = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI research assistant for "${paper.title}". I've analyzed the full paper and can help you understand its concepts, methodology, and implications. What would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        {
          content: "The Transformer architecture introduces a novel approach to sequence modeling that relies entirely on attention mechanisms, eliminating the need for recurrence or convolution. This allows for better parallelization and captures long-range dependencies more effectively.",
          references: ["Section 3.1", "Figure 1"]
        },
        {
          content: "The multi-head attention mechanism allows the model to attend to information from different representation subspaces at different positions. This is crucial for understanding complex relationships in sequential data.",
          references: ["Section 3.2.2", "Equation 4"]
        },
        {
          content: "The positional encoding scheme used in the Transformer enables the model to understand the order of tokens without relying on recurrent connections. The authors use sine and cosine functions of different frequencies for this purpose.",
          references: ["Section 3.5", "Equation 5"]
        }
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse.content,
        timestamp: new Date(),
        references: randomResponse.references,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What is the main contribution of this paper?",
    "How does the attention mechanism work?",
    "What are the computational advantages?",
    "How does this compare to RNNs and CNNs?"
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/knowledge-canvas">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Canvas
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Paper Agent</h1>
                <p className="text-xs text-gray-500">AI Research Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Paper Info Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-6">
            <div className="space-y-6">
              {/* Paper Header */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
                  {paper.title}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {paper.authors.join(', ')}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  <span>{paper.venue} {paper.year}</span>
                  <span>•</span>
                  <span>{paper.citations?.toLocaleString()} citations</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {paper.topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save to Library
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on ArXiv
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Paper Sections */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Sections</h3>
                <div className="space-y-1">
                  {paper.sections.map((section: string, index: number) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <FileText className="w-3 h-3 mr-2" />
                      {section}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Abstract */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Abstract</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {paper.abstract}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                    {message.type === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">Research Assistant</span>
                      </div>
                    )}
                    
                    <Card className={`${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <CardContent className="p-4">
                        <p className={`text-sm leading-relaxed ${
                          message.type === 'user' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {message.content}
                        </p>
                        
                        {message.references && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-600">References</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {message.references.map((ref, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {message.type === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <span className="text-xs text-gray-400 ml-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="flex justify-end mt-2">
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mr-12">
                  <div className="max-w-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white animate-pulse" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Research Assistant</span>
                    </div>
                    <Card className="bg-white border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">Analyzing paper...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Suggested questions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => setInputValue(question)}
                    >
                      <span className="text-xs">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about this paper..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 