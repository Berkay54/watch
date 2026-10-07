# Aurel — Editorial watch study

Preview: http://127.0.0.1:5173. Start with `npm run dev`; Node 18+ required.
The approved pinned hero continues into four lower campaign scenes. The hero still has two videos; the Collection gallery has three pieces.
The temporary wordmark and model descriptions are editorial placeholders.

## Creative direction

Left: refined serif narrative, model identity, specifications, and collection index.
Right: moving mechanical product footage blended into obsidian through a feathered alpha matte.
The masthead stays restrained and transparent. Watches returns to the first model;
Craft enters Craftsmanship; Discover advances to the second model; Heritage toggles
a short editorial annotation (Escape closes it).

The first product expands from its actual right-stage coordinates toward a configured
focal detail. A 5.8× optical approach makes that detail fill the visual field.
Only at the deepest, zero-luminance macro point does the visible decoder switch.
The next product resolves from that same enlarged coordinate and pulls back to the right.
There are no overlapping video rectangles, water layer, slide transition, or added blur.
At the exact handoff the intentional dark macro state may be held if scrolling stops.
Editorial lines clear quietly before entry and return with the next identity.

## Earlier media and stutter investigation

Watch 02 statistics below describe an earlier placeholder. The current supplied clip reports 15.04 seconds in the browser and is unchanged.

| Asset | Video duration | Dimensions | FPS | Keyframes | Size |
| --- | --- | --- | --- | --- | --- |
| watch-01.mp4 (original) | 7.625 s | 3840 × 2160 | 24 | Opening frame only | 12.06 MB |
| watch-01-scrub.mp4 | 7.625 s | 1920 × 1080 | 24 | Every 3 frames / 0.125 s | 14.30 MB |
| watch-02.mp4 (placeholder) | 15.000 s | 3840 × 2160 | 25 | Approximately every 3.04 s | 42.25 MB |

All are H.264 High / yuv420p. Watch 02's browser container duration is 15.018333 s.
The current Watch 02 differs from the asset in the earlier prototype; current metadata
was freshly inspected. Its video is intentionally left untouched.

The main Watch 01 bottleneck was its single GOP across all 183 frames plus 4K decoding.
The prior scheduler already gated outstanding seeks, so adding more JS interpolation
would not remove that bottleneck. A separate derivative preserves the original file.
It uses CRF 17, Lanczos downsampling, GOP 3, no B-frames, no audio, and faststart.
See [FFmpeg's encoder options](https://ffmpeg.org/ffmpeg-codecs.html#libx264_002c-libx264rgb).

An identical 60-seek forward/reverse browser benchmark measured:
- Original: mean 133.91 ms, p95 237.10 ms, max 246.30 ms.
- Derivative: mean 6.00 ms, p95 6.20 ms, max 21.00 ms.
- Approximately 22× improvement in mean latency; the derivative is used because of this result.
- SSIM against the original downsampled to the same 1080p resolution: 0.993390.

Live-scene traversal averaged approximately 2 ms per Watch 01 seek.
The 4K Watch 02 placeholder still averaged approximately 60 ms and reached 269 ms
in a continuous reverse test. It can visibly lag during fast scroll; no derivative or
asset-specific visual polish was added for it. All media remains paused.

## Preserved architecture

The existing CSS sticky stage, passive native-scroll observation, RAF loop, and
one-outstanding-seek-per-decoder gating are retained. One normalized coordinate
controls framing, story identity, and target clocks. RAF uses an interruptible 55 ms
response; exact seeks are frame-quantized and capped at one per paint (60 Hz).
The loop sleeps when settled and pauses while the document is hidden.
The original byte-range preview server is unchanged.

Each adjacent pair uses the same dwell → approach → handoff → pullback schedule.
Total scroll length comes from the number of model entries.
To replace Watch 02, replace `public/media/watch-02.mp4` and reload.
Duration is read from the video, so there is no fixed eight-second cutoff.
Adjust its `fps`, focal point, overscan, still time, and editorial text in
`src/models.js` if the new shot requires them. A third model can later be appended
to that array; it is not implemented now.

Mobile recomposes the narrative above a dominant product, with compact navigation
and model information below. Reduced motion presents both configured watches as
stable stills captured in memory from the source videos; no scroll scrub or camera
approach runs in that mode. The two fallback entries are the same campaign models,
not additional website sections. Switching back hides those stills.

## Validation

Playwright checked initial load, slow scroll, continuous forward/reverse traversal,
fast jumps, native wheel scrolling, and 15 transition/boundary coordinates.
A corrected audit waited for the actual native-scroll event, exact settled progress,
and quantized decoder time before comparing forward and reverse states.
Transforms, text visibility, and rendered times reproduced identically.

All seven requested A–G states were captured and visually inspected, plus mobile
initial/macro/second-product, wide desktop, and both reduced-motion presentations.
Checked viewports: 1440 × 900, 1920 × 1080, 1280 × 600, and 390 × 844.
No horizontal overflow, application console errors, or runtime errors.
Both reduced-motion still times remained unchanged after wheel input.
Heritage, Escape dismissal, Discover, and return to normal motion were checked.
No water media request occurred.

Current evidence is in `artifacts/editorial-*`.
Earlier artifacts record the superseded prototype; the application no longer uses it.
Run `npm run check` for syntax, `npm run media:inspect` for fresh metadata,
or `npm run media:optimize` to reproduce Watch 01's derivative.
The last command uses `FFMPEG_PATH` or the downloaded project-local
`.tools/package/ffmpeg.exe`; .tools is ignored by Git.
No commits or pushes were made.

## Lower campaign extension

The approved hero now continues into Collection, Craftsmanship, Heritage, and closing.
Desktop copy gains clamp(48px,4.2vw,72px) beyond its approved 5vw inset:
72px becomes 132.47px at 1440px. The product frame remains x=619.19, y=108,
width=936, height=720. Hero typography, decoder behavior, and inner choreography remain.

Original film travel remains 6440px desktop / 4480px mobile. A separate exit tail
adds one stage height desktop / 0.7 mobile. Only after the film clock finishes,
the outer product reduces and moves inward, typography clears, and darkness opens
into Collection. Collection compensates its native position during this tail.
Forward/reverse transforms reproduce exactly; paused video clocks stay at their ends.

Three cyclic gallery positions use translation, scale, overlap, crop, and lighting
hierarchy. Arrows, neighboring-piece clicks, horizontal drag, touch swipe, and
ArrowLeft/ArrowRight/Home/End work. Vertical scrolling remains native.
Pointer capture starts after horizontal intent; drag-generated clicks are suppressed.
Identity/specifications use interruptible masked vertical replacement.
Pointer motion moves the active photo at most four pixels. Discover opens piece copy.

The four motion moments are hero exit, gallery depth, Craftsmanship aperture, and
closing photo scale. Heritage stays still. Scroll uses a waking RAF and cached
measurements. No new dependencies, WebGL, heavy filters, autoplay, or idle loops.

Mobile uses an 88vw dominant piece with side peeks, information and touch controls
below; editorial spreads stack. Reduced motion keeps hero stills, static lower
imagery, and immediate gallery updates. Keyboard updates are also immediate.

### 21st references inspected

- [Stacked Card Image Carousel](https://21st.dev/@kedhareswer/components/card-deck-carousel): overlap and center/neighbor hierarchy.
- [Aperture Reveal Image Carousel](https://21st.dev/@kedhareswer/components/aperture-carousel): Craftsmanship mask opening.
- [Stepped Morph Image Slider](https://21st.dev/@kedhareswer/components/stepped-morph-slider): coordinated imagery and clipped identity replacement.
- [Animated Gallery](https://21st.dev/@youcefbnm/components/animated-gallery): large horizontal exhibition imagery.

Four MCP results and downloaded previews were inspected. Source retrieval hit the
account's exhausted free quota. No component code or default visual styling was copied.
Native HTML/CSS/JS adapts these principles around the campaign. See artifacts/references/.

### Imagery

Skeleton: still at 14.96s from supplied Watch 02. Craft: still at 2.5s from original
Watch 01. Source videos are untouched. Two imagegen concept photos were generated:
- Nocturne: portrait studio watch, brushed steel, charcoal dial, black leather,
  small seconds, 10:10, no logo/text, restrained dark luxury lighting.
- Patrimoine: portrait vintage watch, patinated champagne gold, ivory dial,
  fine blue hands, brown leather, no logo/text, matching dark palette.
Original PNGs and deployed WebP copies are in public/images/.
Product specifications and heritage are fictional; the minimal footer states this.

### Current QA

Playwright inspected original hero before/after the inset, handoff and reverse
states, initial gallery, mid-transition, another active piece, Craftsmanship,
Heritage, closing, and mobile versions. Viewports: 1440x900, 1920x1080,
1280x600, 390x844. Real CDP touch advanced the mobile gallery.
Controls, keyboard, drag, neighboring clicks, details, resize, reduced motion,
and source-video clocks were checked. No horizontal overflow or broken images.
Final tail and mobile/reduced-motion checks recorded zero application errors.
A stale caption reference caught during cleanup was fixed and rechecked.
An earlier synthetic pointer dispatch lacked an active browser pointer;
real touch input passed without an error.

Evidence: artifacts/lower-*.png and artifacts/lower-playwright-results.json.
npm run check passed. Preview: http://127.0.0.1:5173.
Files changed this phase: index.html, src/scene.js, src/campaign.js,
src/campaign.css, package.json, README.md; new image and QA/research assets.
No commits or pushes. The workspace is not a Git repository.
