# 🧠 DataEngineX - AI Research Discovery Platform

> **A next-generation research paper discovery and knowledge management system competing with NotebookLM**

DataEngineX transforms how researchers discover, analyze, and connect academic papers through AI-powered insights and interactive knowledge visualization.

## 🎯 **Vision**
Create a long-form research platform that enables deep understanding of complex research domains through:
- **Search-First Discovery**: Ask research questions, get relevant papers instantly
- **Interactive Knowledge Bases**: Build and visualize connections between ideas
- **AI Paper Agents**: Chat with papers like Cursor AI agents for PDFs
- **Connection Mapping**: Visual canvas showing how concepts and papers relate

---

## 🚀 **Core Features**

### 1. **🔍 Research Hub** (Landing Page)
- **AI-Powered Search**: Semantic search through research papers
- **Instant Results**: Real-time paper discovery with ArXiv integration
- **Smart Filtering**: Impact levels, citations, topics, and years
- **Demo Mode**: Works without API keys using intelligent mock data

### 2. **🕸️ Knowledge Canvas** 
- **Interactive Network**: Papers as nodes, connections as edges
- **Visual Exploration**: Click, drag, and explore paper relationships
- **Smart Clustering**: Related papers automatically grouped
- **Real-time Search**: Filter and highlight relevant papers

### 3. **🤖 Paper Agent** (Individual Papers)
- **Cursor-Style Chat**: AI agent for each paper
- **Contextual Q&A**: Ask about methodology, results, implications
- **Reference Linking**: Answers link to specific sections and pages
- **PDF Integration**: Side-by-side paper view with chat interface

### 4. **📊 Insights Dashboard** (Future)
- **Trend Analysis**: Emerging topics and research directions
- **Citation Networks**: Author and institutional connections
- **Knowledge Gaps**: Identify unexplored research areas

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework**: Remix (React) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Custom CSS animations + Framer Motion
- **Icons**: Lucide React (modern, consistent icons)

### **Backend API** (Separate Service)
- **Framework**: FastAPI with automatic OpenAPI docs
- **Search**: ArXiv API integration
- **AI Processing**: Chunkr AI for document processing
- **Database**: Supabase (production) / Demo mode (development)
- **RAG**: Semantic search within saved papers

### **Key Libraries**
```json
{
  "remix": "^2.16.8",
  "tailwindcss": "^3.4.17", 
  "lucide-react": "^0.511.0",
  "@headlessui/react": "^2.0.0",
  "framer-motion": "^11.0.0"
}
```

---

## 🏃‍♂️ **Quick Start**

### **Prerequisites**
- Node.js 20+ 
- npm or yarn
- (Optional) Backend API running on localhost:8000

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd DelphiX

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Backend Setup** (Optional)
```bash
# For full functionality, start the backend API
# Follow backend README for setup instructions
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Demo Mode**: The frontend works standalone with intelligent mock data for hackathon demos.

---

## 🎪 **Demo Flow** (Hackathon Presentation)

### **Act 1: Discovery** (30 seconds)
1. **Open DataEngineX** → Beautiful animated landing page
2. **Ask Research Question**: "How do transformers work in NLP?"
3. **Instant Results**: 10+ relevant papers with impact indicators
4. **Visual Appeal**: Gradient backgrounds, smooth animations

### **Act 2: Knowledge Base Creation** (45 seconds)
1. **Select Papers**: Click papers of interest
2. **Create Knowledge Base**: Single button click
3. **Navigate to Canvas**: Animated transition to network view
4. **Explore Connections**: Interactive paper nodes with relationships

### **Act 3: Deep Dive** (60 seconds)
1. **Click Paper Node**: Select "Attention Is All You Need"
2. **Open Paper Agent**: Split-screen PDF + AI chat
3. **Ask Questions**: 
   - "What is the main contribution?"
   - "How does the attention mechanism work?"
   - "Show me the key results"
4. **Smart Responses**: AI answers with paper references

### **Act 4: Visual Insights** (30 seconds)
1. **Back to Canvas**: Overview of research landscape
2. **Connection Mapping**: See how papers relate
3. **Search Filter**: Find specific topics instantly
4. **Future Vision**: Mention scaling to thousands of papers

---

## 🎨 **Design Philosophy**

### **Modern & Sleek**
- **Dark Theme**: Professional research environment
- **Gradients**: Purple-to-blue for premium feel
- **Glass Morphism**: Subtle transparency and blur effects
- **Micro-interactions**: Hover states, loading animations

### **Speed & Performance**
- **Instant Feedback**: No loading states over 1 second
- **Smooth Animations**: 60fps transitions
- **Optimistic Updates**: UI updates before API responses
- **Progressive Enhancement**: Works offline with demo data

### **Intuitive UX**
- **Search-First**: Every action starts with a question
- **Progressive Disclosure**: Show complexity only when needed
- **Visual Hierarchy**: Clear information architecture
- **Accessibility**: Keyboard navigation, screen reader support

---

## 📁 **Project Structure**

```
DelphiX/
├── app/
│   ├── components/ui/          # shadcn/ui components
│   ├── routes/
│   │   ├── _index.tsx          # Research Hub (landing)
│   │   ├── knowledge-canvas.tsx # Interactive network view
│   │   └── paper.$paperId.tsx   # Paper Agent interface
│   ├── tailwind.css           # Global styles + animations
│   └── root.tsx               # App shell
├── public/                    # Static assets
├── package.json              # Dependencies
├── tailwind.config.ts        # Custom animations & theme
└── README.md                 # This file
```

---

## 🎯 **Hackathon Strategy**

### **Winning Elements**
1. **Visual Impact**: Stunning UI that wows judges immediately
2. **Clear Value Prop**: "NotebookLM for researchers who need deep connections"
3. **Interactive Demo**: Judges can use it themselves
4. **Technical Excellence**: Clean code, modern stack, smooth performance
5. **Scalability Story**: Show how it handles thousands of papers

### **Demo Script** (2 minutes)
```
"Researchers spend 40% of their time just finding relevant papers.
DataEngineX changes that.

[Show landing page]
Instead of keyword search, you ask research questions.

[Type: 'How do neural networks learn representations?']
Our AI finds semantically relevant papers instantly.

[Create knowledge base]
But here's the magic - we don't just find papers,
we show you how they connect.

[Navigate to canvas]
This is your research landscape. Each paper is a node,
connections show relationships.

[Click on paper]
And when you want to go deep, meet your Paper Agent.

[Ask questions in chat]
It's like having a research assistant who has read
every paper and can explain any concept.

[Show canvas overview]
This is the future of research - not just search,
but understanding. Not just papers, but connections.
Not just information, but insights."
```

---

## 🚧 **Development Roadmap**

### **Phase 1: MVP** ✅
- [x] Research Hub with search interface
- [x] Knowledge Canvas with interactive nodes
- [x] Paper Agent with AI chat
- [x] Demo mode with mock data
- [x] Modern UI with animations

### **Phase 2: Production Integration**
- [ ] Backend API integration
- [ ] Real ArXiv search results
- [ ] User authentication
- [ ] Knowledge base persistence
- [ ] PDF upload and processing

### **Phase 3: Advanced Features**
- [ ] Collaborative knowledge bases
- [ ] Citation analysis
- [ ] Research trend prediction
- [ ] Export and sharing tools
- [ ] Mobile responsiveness

### **Phase 4: Scale**
- [ ] Institution integrations
- [ ] Team workspace features
- [ ] Advanced analytics
- [ ] Plugin ecosystem

---

## 🏆 **Competitive Advantages**

### **vs. NotebookLM**
- ✅ **Better Discovery**: Semantic search vs basic upload
- ✅ **Visual Connections**: Network view vs linear interface  
- ✅ **Specialized for Research**: Domain-specific features
- ✅ **Open Ecosystem**: ArXiv integration vs closed system

### **vs. Traditional Tools**
- ✅ **AI-Native**: Built for AI interaction from ground up
- ✅ **Connection-Focused**: Relationships, not just content
- ✅ **Modern UX**: 2024 interface standards
- ✅ **Real-time**: Instant feedback and updates

---

## 📝 **License**

MIT License - Built for the research community

---

## 🤝 **Contributing**

This is a hackathon project, but we welcome contributions for the open-source research community.

---

**Built with ❤️ for researchers who want to understand how ideas connect**
