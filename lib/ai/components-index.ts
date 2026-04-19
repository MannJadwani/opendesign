export type ComponentRef = {
  name: string;
  pattern: string;
  vibe: string[];
  notes: string;
  snippet: string;
};

export const COMPONENTS: ComponentRef[] = [
  {
    name: "Editorial masthead",
    pattern: "hero",
    vibe: ["editorial", "serif", "literary"],
    notes: "Oversized serif display, thin rule underline, small uppercase eyebrow, dateline treatment.",
    snippet: `<section data-cd-id="hero" class="border-b border-black/10 pt-16 pb-10"><p class="text-[10px] uppercase tracking-[0.3em]">Issue 04 · Spring</p><h1 class="font-serif text-[7rem] leading-[0.95] mt-6">Headline here</h1></section>`,
  },
  {
    name: "Split hero with product shot",
    pattern: "hero",
    vibe: ["product", "commerce", "showroom"],
    notes: "50/50 text vs. image. Tight leading, one CTA, subtle surface tint on image side.",
    snippet: `<section data-cd-id="hero" class="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]"><div class="p-16 flex flex-col justify-center"><h1 class="text-6xl">Title</h1></div><div class="bg-[surface] p-16"><img src="..." class="w-full"/></div></section>`,
  },
  {
    name: "Terminal hero",
    pattern: "hero",
    vibe: ["terminal", "brutalist", "dev-tool"],
    notes: "Mono type, ASCII cursor, single accent color (usually green/amber), no images.",
    snippet: `<section data-cd-id="hero" class="font-mono p-16"><p class="text-[green]">$ opendesign init</p><h1 class="text-5xl mt-6">Prompt. Shape. Ship.</h1></section>`,
  },
  {
    name: "Catalog nav",
    pattern: "nav",
    vibe: ["editorial", "catalog"],
    notes: "Numbered sections, serif wordmark, right-aligned issue/date, thin top rule.",
    snippet: `<nav data-cd-id="nav" class="flex items-center justify-between py-4 border-b border-black/10"><span class="font-serif italic">Journal</span><ul class="flex gap-6 text-[11px] tracking-[0.2em] uppercase"><li>01 Work</li><li>02 Notes</li></ul></nav>`,
  },
  {
    name: "Sticky minimal nav",
    pattern: "nav",
    vibe: ["saas", "minimal", "product"],
    notes: "Wordmark left, 3-4 links center, 1 CTA right. Backdrop blur on scroll.",
    snippet: `<nav data-cd-id="nav" class="sticky top-0 backdrop-blur bg-white/70 px-6 py-3 flex items-center justify-between"><span>Brand</span><ul class="flex gap-6 text-sm"><li>Product</li><li>Pricing</li></ul><a class="rounded-full bg-black text-white px-4 py-2 text-sm">Start</a></nav>`,
  },
  {
    name: "Logo marquee",
    pattern: "social-proof",
    vibe: ["saas", "startup"],
    notes: "Greyscale logos, auto-scroll, slight fade on edges. 'Trusted by' eyebrow.",
    snippet: `<section data-cd-id="social-proof" class="py-12 border-y border-black/5"><p class="text-center text-[11px] uppercase tracking-[0.2em] text-black/50">Trusted by</p><div class="flex gap-10 justify-center mt-6 grayscale opacity-60">[logos]</div></section>`,
  },
  {
    name: "Three-tier pricing",
    pattern: "pricing",
    vibe: ["saas", "conventional"],
    notes: "Middle tier elevated (border + scale). Monthly/annual toggle above. Checkmark feature list.",
    snippet: `<section data-cd-id="pricing" class="grid grid-cols-1 md:grid-cols-3 gap-4">[card][card featured][card]</section>`,
  },
  {
    name: "Tabbed pricing",
    pattern: "pricing",
    vibe: ["editorial", "minimal"],
    notes: "Tabs for tier selection, single detail panel below — less visual noise than 3-up.",
    snippet: `<section data-cd-id="pricing"><div class="flex gap-2">[tab][tab][tab]</div><div class="mt-8 border-t pt-8">[detail panel]</div></section>`,
  },
  {
    name: "Feature grid",
    pattern: "features",
    vibe: ["saas", "product"],
    notes: "2-3-4 responsive grid. One-line headline + 2-sentence body + small icon/illustration.",
    snippet: `<section data-cd-id="features" class="grid grid-cols-1 md:grid-cols-3 gap-10 py-20">[cell x 6]</section>`,
  },
  {
    name: "Manifesto section",
    pattern: "features",
    vibe: ["editorial", "brutalist", "opinionated"],
    notes: "One huge paragraph of positioning copy. Drop cap. No bullets. Anti-feature-grid.",
    snippet: `<section data-cd-id="features" class="max-w-3xl mx-auto py-32"><p class="font-serif text-3xl leading-relaxed first-letter:text-7xl first-letter:float-left first-letter:mr-2">We believe...</p></section>`,
  },
  {
    name: "Testimonial wall",
    pattern: "testimonial",
    vibe: ["saas", "social-proof"],
    notes: "Masonry of quote cards. Mixed sizes. Author name + role + avatar per card.",
    snippet: `<section data-cd-id="testimonials" class="columns-1 md:columns-3 gap-4">[card x N]</section>`,
  },
  {
    name: "Single-quote testimonial",
    pattern: "testimonial",
    vibe: ["editorial", "premium"],
    notes: "One oversized quote centered. No avatar. Author as byline below.",
    snippet: `<section data-cd-id="testimonials" class="py-24 text-center"><blockquote class="font-serif italic text-4xl max-w-3xl mx-auto">"..."</blockquote><p class="mt-6 text-sm">— Author</p></section>`,
  },
  {
    name: "FAQ disclosure",
    pattern: "faq",
    vibe: ["product", "conventional"],
    notes: "Accordion items. Question bold, answer in muted color. Divider between items.",
    snippet: `<section data-cd-id="faq"><details class="border-b py-4"><summary>Question</summary><p class="mt-2 text-black/60">Answer</p></details></section>`,
  },
  {
    name: "CTA stripe",
    pattern: "cta",
    vibe: ["saas", "direct"],
    notes: "Full-width band. Single headline + 1-2 buttons. High contrast vs surrounding sections.",
    snippet: `<section data-cd-id="cta" class="bg-black text-white py-24 text-center"><h2 class="text-5xl">Start today</h2><a class="mt-6 inline-block rounded-full bg-white text-black px-6 py-3">Get started</a></section>`,
  },
  {
    name: "Editorial footer",
    pattern: "footer",
    vibe: ["editorial", "catalog"],
    notes: "Columns of links labeled like magazine sections. Issue/colophon line at bottom.",
    snippet: `<footer data-cd-id="footer" class="border-t py-16 grid grid-cols-4 gap-8">[columns]<p class="col-span-4 text-[11px] uppercase tracking-[0.2em] mt-12">© 2026 · Issue IV</p></footer>`,
  },
  {
    name: "Utility footer",
    pattern: "footer",
    vibe: ["saas", "minimal"],
    notes: "Single row: wordmark left, link groups center, social icons right.",
    snippet: `<footer data-cd-id="footer" class="py-10 flex items-center justify-between border-t"><span>Brand</span><ul class="flex gap-6">[links]</ul><div>[social]</div></footer>`,
  },
  {
    name: "Phone-frame hero (mobile)",
    pattern: "mobile-hero",
    vibe: ["mobile-app", "product"],
    notes: "Centered max-w-[420px] device frame. Status bar, content, home indicator.",
    snippet: `<section data-cd-id="app-root" class="mx-auto max-w-[420px] bg-[surface] min-h-screen">[content]</section>`,
  },
  {
    name: "Slide-up mobile sheet",
    pattern: "mobile-sheet",
    vibe: ["mobile-app", "native"],
    notes: "Rounded-top sheet, handle, padded content. Backdrop dim layer.",
    snippet: `<div data-cd-id="sheet" class="fixed inset-x-0 bottom-0 rounded-t-3xl bg-white p-6 shadow-xl"><div class="mx-auto h-1 w-10 rounded-full bg-black/20 mb-4"></div>[content]</div>`,
  },
  {
    name: "Zine gallery",
    pattern: "gallery",
    vibe: ["editorial", "zine", "portfolio"],
    notes: "Intentionally misaligned grid. Mixed image aspects. Handwritten-feel captions.",
    snippet: `<section data-cd-id="gallery" class="grid grid-cols-12 gap-4 py-16">[img col-span-5 row-span-2][img col-span-4][...]</section>`,
  },
  {
    name: "Runway grid",
    pattern: "gallery",
    vibe: ["fashion", "editorial"],
    notes: "Tight 4-column image grid. All images same aspect. Tiny caption under each.",
    snippet: `<section data-cd-id="gallery" class="grid grid-cols-2 md:grid-cols-4 gap-1">[img + caption x N]</section>`,
  },
];

export function searchComponentsIndex(
  pattern: string,
  vibe?: string,
): ComponentRef[] {
  const p = pattern.toLowerCase();
  const v = vibe?.toLowerCase();
  const scored = COMPONENTS.map((c) => {
    let score = 0;
    if (c.pattern === p) score += 3;
    else if (c.pattern.includes(p) || p.includes(c.pattern)) score += 2;
    if (c.name.toLowerCase().includes(p)) score += 1;
    if (v) {
      for (const tag of c.vibe) {
        if (tag === v) score += 2;
        else if (tag.includes(v) || v.includes(tag)) score += 1;
      }
    }
    return { c, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.c);
}
