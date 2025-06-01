import httpx
import xml.etree.ElementTree as ET
from typing import List
from time import sleep
import uuid
from datetime import datetime, timedelta
import asyncio

from app.models.paper import PaperResponse
from app.utils.config import Config
from app.utils.pdf_utils import extract_text_from_pdf

class ArxivService:
    def __init__(self):
        self.base_url = Config.ARXIV_BASE_URL
        self.semantic_scholar_url = "https://api.semanticscholar.org/v1"
        self.headers = {
            'User-Agent': Config.USER_AGENT
        }
        if Config.SEMANTIC_SCHOLAR_API_KEY:
            self.headers['x-api-key'] = Config.SEMANTIC_SCHOLAR_API_KEY
        self.timeout = Config.API_TIMEOUT

    async def _get_citation_data(self, arxiv_id: str) -> dict:
        """Get citation data from Semantic Scholar"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.semantic_scholar_url}/paper/arXiv:{arxiv_id}",
                    headers=self.headers
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        'citations': data.get('citationCount', 0),
                        'influential_citations': data.get('influentialCitationCount', 0),
                        'references': len(data.get('references', [])),
                        'venue': data.get('venue', 'arXiv'),
                        'year': data.get('year'),
                        'topics': [topic['topic'] for topic in data.get('topics', [])]
                    }
                return {}
        except Exception as e:
            print(f"Error fetching citation data: {e}")
            return {}

    async def _get_full_text(self, arxiv_id: str) -> str:
        """Get full text of paper from ArXiv"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # First get the PDF URL
                pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                response = await client.get(pdf_url, follow_redirects=True)
                if response.status_code == 200:
                    # Extract text from PDF bytes
                    return extract_text_from_pdf(response.content)
                return ""
        except Exception as e:
            print(f"Error fetching full text: {e}")
            return ""

    def _parse_entry(self, entry, ns) -> PaperResponse:
        """Parse a single ArXiv entry into a PaperResponse"""
        # Extract authors
        authors = [author.find('atom:name', ns).text 
                  for author in entry.findall('atom:author', ns)]
        
        # Extract and clean title
        title_elem = entry.find('atom:title', ns)
        title = title_elem.text.strip().replace('\n', ' ') if title_elem is not None else "No title"
        
        # Extract and clean abstract
        summary_elem = entry.find('atom:summary', ns)
        abstract = summary_elem.text.strip().replace('\n', ' ') if summary_elem is not None else None
        
        # Extract arXiv ID and create URL
        id_elem = entry.find('atom:id', ns)
        arxiv_id = id_elem.text.split('/abs/')[-1] if id_elem is not None else None
        url = f"https://arxiv.org/pdf/{arxiv_id}.pdf" if arxiv_id else None
        
        # Extract published date and convert to year
        published_elem = entry.find('atom:published', ns)
        year = int(published_elem.text[:4]) if published_elem is not None else None
        
        # Extract categories for topics
        categories = entry.findall('atom:category', ns)
        topics = [cat.get('term') for cat in categories if cat.get('term')]
        
        # Get citation data if available
        citation_data = asyncio.run(self._get_citation_data(arxiv_id)) if arxiv_id else {}
        
        # Get full text
        full_text = asyncio.run(self._get_full_text(arxiv_id)) if arxiv_id else ""
        
        return PaperResponse(
            id=arxiv_id or str(uuid.uuid4()),
            title=title,
            authors=authors,
            abstract=abstract,
            year=citation_data.get('year', year) or 2024,
            citations=citation_data.get('citations', 0),
            impact="high" if citation_data.get('citations', 0) > 100 else "low",
            url=url or "",
            topics=citation_data.get('topics', topics),
            institution=None,
            venue=citation_data.get('venue', 'arXiv'),
            full_text=full_text
        ) 