// Test Google Scholar scraping
async function fetchFromGoogleScholar(scholarId) {
  try {
    console.log(`Fetching Google Scholar for user: ${scholarId}`);
    
    const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&cstart=0&pagesize=100`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`Google Scholar fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const publications = [];

    // Parse HTML to extract publications
    const titleRegex = /<a[^>]*class="gsc_a_at"[^>]*>(.*?)<\/a>/g;
    const yearRegex = /<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/g;
    const citationRegex = /<a[^>]*class="gsc_a_ac gs_ibl"[^>]*>(\d+)<\/a>/g;
    
    // Extract titles
    const titles = [];
    let titleMatch;
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      if (title) titles.push(title);
    }

    // Extract years
    const years = [];
    let yearMatch;
    while ((yearMatch = yearRegex.exec(html)) !== null) {
      years.push(parseInt(yearMatch[1]));
    }

    // Extract citations
    const citations = [];
    let citationMatch;
    while ((citationMatch = citationRegex.exec(html)) !== null) {
      citations.push(parseInt(citationMatch[1]));
    }

    console.log(`Extracted from Google Scholar: ${titles.length} titles, ${years.length} years, ${citations.length} citations`);

    // Combine data
    for (let i = 0; i < titles.length; i++) {
      publications.push({
        title: titles[i],
        year: years[i] || new Date().getFullYear(),
        venue: "Journal/Conference",
        authors: [],
        citations: citations[i] || 0,
        type: "article",
        source: "Google Scholar",
      });
    }

    console.log(`Successfully extracted ${publications.length} publications from Google Scholar`);
    return publications;
  } catch (error) {
    console.error("Google Scholar fetch error:", error);
    return [];
  }
}

// Test with the provided Scholar ID
const scholarId = "VyRk8ZAAAAAJ";
console.log(`\n🔍 Testing Google Scholar scraping for ID: ${scholarId}\n`);

const pubs = await fetchFromGoogleScholar(scholarId);

console.log(`\n✅ RESULTS: Found ${pubs.length} publications\n`);

if (pubs.length > 0) {
  console.log("First 5 publications:");
  pubs.slice(0, 5).forEach((pub, idx) => {
    console.log(`\n${idx + 1}. ${pub.title}`);
    console.log(`   Year: ${pub.year}, Citations: ${pub.citations}`);
  });
}
