import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createClient } from "~/lib/supabase.server";

const DATA_ENGINE_URL = process.env.DATA_ENGINE_URL || 'http://localhost:8080';

export const action: ActionFunction = async ({ request }) => {
  try {
    const supabase = createClient(request);
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { query, page = 1, limit = 25 } = body;
    
    const start = (page - 1) * limit;
    const params = new URLSearchParams({
      query,
      start: start.toString(),
      max_results: limit.toString(),
      sort_by: "relevance",
      sort_order: "descending"
    });

    const response = await fetch(
      `${DATA_ENGINE_URL}/api/arxiv/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from DataEngine");
    }

    const papers = await response.json();
    
    // Get user's reading list to check which papers are already added
    const { data: readingList } = await supabase
      .from('reading_list')
      .select('paper_id, arxiv_id, scheduled_date, estimated_time, repeat, status');

    // Create a map using arxiv_id for lookup
    const readingListMap = new Map(
      (readingList || []).map(item => [item.arxiv_id, item])
    );
    
    // Assign IDs and check reading list status
    const papersWithIds = papers.map(paper => {
      const arxivId = paper.id; // Store the original ArXiv ID
      const readingListItem = readingListMap.get(arxivId);
      
      return {
        ...paper,
        id: readingListItem?.paper_id || crypto.randomUUID(), // Use existing UUID if in reading list
        arxiv_id: arxivId,
        source: 'search',
        created_at: new Date().toISOString(),
        in_reading_list: !!readingListItem,
        scheduled_date: readingListItem?.scheduled_date,
        estimated_time: readingListItem?.estimated_time,
        repeat: readingListItem?.repeat,
        status: readingListItem?.status || 'unread',
        metadata: { 
          institution: paper.institution,
          query: query
        }
      };
    });

    return json({ papers: papersWithIds, total: papers.length });
  } catch (error) {
    console.error("Search error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to search papers" },
      { status: 500 }
    );
  }
}; 