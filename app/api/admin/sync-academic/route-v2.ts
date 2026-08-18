// This is the PARALLEL FETCH VERSION - fetches from ALL sources simultaneously

// Array to store all fetch promises
const fetchPromises: Promise<any[]>[] = [];
const sourcesList: string[] = [];

debugInfo.push(`\n⚡ Starting PARALLEL fetch from ALL sources...`);

// Try Google Scholar
const scholarProfile = academicProfiles.find((p) => 
  p.label.toLowerCase().includes("scholar") || 
  p.url.toLowerCase().includes("scholar.google")
);

if (scholarProfile) {
  const scholarId = extractScholarID(scholarProfile.url);
  debugInfo.push(`🎓 Google Scholar profile found`);
  
  if (scholarId) {
    sourcesList.push("Google Scholar");
    fetchPromises.push(
      fetchFromGoogleScholar(scholarId).catch(() => [])
    );
  }
}

// Try ORCID
const orcidProfile = academicProfiles.find((p) => 
  p.label.toLowerCase().includes("orcid") || p.url.toLowerCase().includes("orcid")
);

if (orcidProfile) {
  const orcidId = extractORCID(orcidProfile.url);
  debugInfo.push(`🆔 ORCID profile found`);
  
  if (orcidId) {
    sourcesList.push("ORCID");
    fetchPromises.push(
      fetchFromORCID(orcidId).catch(() => [])
    );
  }
}

// Always try Semantic Scholar
sourcesList.push("Semantic Scholar");
fetchPromises.push(
  fetchFromSemanticScholar(profile.fullName).catch(() => [])
);

// Always try CrossRef
sourcesList.push("CrossRef");
fetchPromises.push(
  fetchFromCrossRef(profile.fullName).catch(() => [])
);

// Always try arXiv
sourcesList.push("arXiv");
fetchPromises.push(
  fetchFromArxiv(profile.fullName).catch(() => [])
);

debugInfo.push(`\n⏳ Fetching from ${fetchPromises.length} sources in parallel...`);

// Fetch from all sources in parallel
const allResults = await Promise.all(fetchPromises);

// Combine all results
allResults.forEach((pubs, idx) => {
  if (pubs.length > 0) {
    allPublications.push(...pubs);
    if (!sources.includes(sourcesList[idx])) {
      sources.push(sourcesList[idx]);
    }
    debugInfo.push(`✅ ${sourcesList[idx]}: ${pubs.length} publications`);
  } else {
    debugInfo.push(`⚠️ ${sourcesList[idx]}: 0 publications`);
  }
});

debugInfo.push(`\n📊 Total from all sources: ${allPublications.length} publications`);
