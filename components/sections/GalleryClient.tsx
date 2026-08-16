"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { filterByCategory } from "@/lib/gallery";
import type { GalleryItem } from "@prisma/client";

interface GalleryClientProps {
  items: GalleryItem[];
  categories: string[];
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url) ||
    url.includes("youtube.com") || url.includes("youtu.be") ||
    url.includes("vimeo.com");
}

function getYouTubeEmbed(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbed(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export default function GalleryClient({ items, categories }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "slideshow">("grid");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    let result = filterByCategory(items, selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.caption.toLowerCase().includes(q) ||
        i.alt.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, selectedCategory, search]);

  const photos = filteredItems.filter(i => !isVideo(i.imageUrl));
  const videos = filteredItems.filter(i => isVideo(i.imageUrl));

  // Slideshow auto-advance
  const nextSlide = useCallback(() => {
    setSlideshowIndex(i => (i + 1) % filteredItems.length);
  }, [filteredItems.length]);

  useEffect(() => {
    if (!slideshowPlaying || viewMode !== "slideshow") return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [slideshowPlaying, viewMode, nextSlide]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxItem) return;
    const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxItem(filteredItems[(idx + 1) % filteredItems.length]);
      if (e.key === "ArrowLeft") setLightboxItem(filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]);
      if (e.key === "Escape") setLightboxItem(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxItem, filteredItems]);

  function handleDownload(item: GalleryItem) {
    const a = document.createElement("a");
    a.href = item.imageUrl;
    a.download = item.caption || "gallery-image";
    a.target = "_blank";
    a.click();
  }

  function handleShare(item: GalleryItem) {
    if (navigator.share) {
      navigator.share({ title: item.caption, text: item.alt, url: item.imageUrl });
    } else {
      navigator.clipboard.writeText(item.imageUrl);
      alert("Image URL copied to clipboard!");
    }
  }

  const currentSlide = filteredItems[slideshowIndex];

  return (
    <div>
      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="gallery-search" className="sr-only">Search gallery</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="gallery-search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search photos..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button onClick={() => setViewMode("grid")} aria-label="Grid view"
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-navy-600 hover:bg-navy-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button onClick={() => { setViewMode("slideshow"); setSlideshowIndex(0); }} aria-label="Slideshow view"
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${viewMode === "slideshow" ? "bg-primary text-white" : "text-navy-600 hover:bg-navy-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Slideshow
          </button>
        </div>
      </div>

      {/* ── CATEGORY FILTERS ── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter by category">
          <button onClick={() => setSelectedCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedCategory === "" ? "bg-primary text-white" : "bg-navy-100 text-navy-700 hover:bg-navy-200"}`}
            aria-pressed={selectedCategory === ""}>
            All ({items.length})
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedCategory === cat ? "bg-primary text-white" : "bg-navy-100 text-navy-700 hover:bg-navy-200"}`}
              aria-pressed={selectedCategory === cat}>
              {cat} ({items.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-sm text-navy-500">
        <span>📷 {photos.length} photos</span>
        {videos.length > 0 && <span>🎬 {videos.length} videos</span>}
        <span className="ml-auto">Showing {filteredItems.length} of {items.length}</span>
      </div>

      {/* ── SLIDESHOW VIEW ── */}
      {viewMode === "slideshow" && filteredItems.length > 0 && (
        <div className="mb-8">
          <div className="relative bg-navy-900 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            {currentSlide && (
              <>
                {isVideo(currentSlide.imageUrl) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-lg">🎬 {currentSlide.caption}</span>
                  </div>
                ) : (
                  <Image src={currentSlide.imageUrl} alt={currentSlide.alt} fill className="object-contain" sizes="100vw" />
                )}
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white font-semibold">{currentSlide.caption}</p>
                  <span className="text-white/70 text-sm">{currentSlide.category}</span>
                </div>
              </>
            )}

            {/* Navigation arrows */}
            <button onClick={() => setSlideshowIndex(i => (i - 1 + filteredItems.length) % filteredItems.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Previous">
              ‹
            </button>
            <button onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Next">
              ›
            </button>
          </div>

          {/* Slideshow controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {filteredItems.map((_, i) => (
                <button key={i} onClick={() => setSlideshowIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === slideshowIndex ? "bg-primary w-6" : "bg-navy-200"}`}
                  aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-navy-500">{slideshowIndex + 1} / {filteredItems.length}</span>
              <button onClick={() => setSlideshowPlaying(p => !p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${slideshowPlaying ? "bg-red-100 text-red-700" : "bg-primary text-white"}`}>
                {slideshowPlaying ? "⏸ Pause" : "▶ Auto Play"}
              </button>
            </div>
          </div>

          {/* Thumbnails strip */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {filteredItems.map((item, i) => (
              <button key={item.id} onClick={() => setSlideshowIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === slideshowIndex ? "border-primary" : "border-transparent"}`}>
                <Image src={item.imageUrl} alt={item.alt} width={64} height={64} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && (
        <>
          {/* Photos section */}
          {photos.length > 0 && (
            <section className="mb-10">
              {videos.length > 0 && <h2 className="text-xl font-bold text-navy-900 mb-4">📷 Photos</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(item => (
                  <div key={item.id} className="group relative bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <button onClick={() => setLightboxItem(item)} className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <div className="relative aspect-square">
                        <Image src={item.imageUrl} alt={item.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      </div>
                    </button>
                    <div className="p-3">
                      <p className="text-sm font-medium text-navy-900 truncate">{item.caption}</p>
                      <span className="text-xs text-navy-400">{item.category}</span>
                    </div>
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(item)} title="Download"
                        className="w-8 h-8 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button onClick={() => handleShare(item)} title="Share"
                        className="w-8 h-8 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos section */}
          {videos.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-navy-900 mb-4">🎬 Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(item => {
                  const ytEmbed = getYouTubeEmbed(item.imageUrl);
                  const vimeoEmbed = getVimeoEmbed(item.imageUrl);
                  return (
                    <div key={item.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-navy-900">
                        {ytEmbed ? (
                          <iframe src={ytEmbed} title={item.caption} className="w-full h-full" allowFullScreen />
                        ) : vimeoEmbed ? (
                          <iframe src={vimeoEmbed} title={item.caption} className="w-full h-full" allowFullScreen />
                        ) : (
                          <video src={item.imageUrl} controls className="w-full h-full object-cover">
                            <track kind="captions" />
                          </video>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-navy-900">{item.caption}</p>
                        <span className="text-xs text-navy-400">{item.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-navy-50 rounded-2xl">
              <p className="text-navy-500">No items match your search.</p>
            </div>
          )}
        </>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxItem && (
        <Modal isOpen={!!lightboxItem} onClose={() => setLightboxItem(null)} title={lightboxItem.caption} size="xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <Image src={lightboxItem.imageUrl} alt={lightboxItem.alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 80vw" />
            </div>
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-navy-700 font-medium">{lightboxItem.caption}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-navy-100 text-navy-700 text-xs rounded-full">{lightboxItem.category}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(lightboxItem)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button onClick={() => handleShare(lightboxItem)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-navy-700 rounded-lg text-sm hover:bg-navy-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
            {/* Navigation */}
            <div className="flex gap-3 w-full justify-center">
              <button onClick={() => {
                const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
                setLightboxItem(filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]);
              }} className="px-4 py-2 border border-border rounded-lg text-sm text-navy-700 hover:bg-navy-50 transition-colors">
                ← Previous
              </button>
              <button onClick={() => {
                const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
                setLightboxItem(filteredItems[(idx + 1) % filteredItems.length]);
              }} className="px-4 py-2 border border-border rounded-lg text-sm text-navy-700 hover:bg-navy-50 transition-colors">
                Next →
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
