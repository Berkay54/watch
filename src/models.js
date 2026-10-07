// Add future models here; adjacent entries share the same approach/handoff/pullback.
export const models = [
  {
    id: 'watch-01', source: '/public/media/watch-01-scrub.mp4',
    original: '/public/media/watch-01.mp4', fps: 24, stillTime: 2.5,
    headline: ['Precision,', 'in every', 'movement.'],
    name: 'Chronograph 01', specification: 'Automatic / 42mm', identity: 'Precision',
    framing: { focus: [58, 43], overscan: 1.14, macroScale: 5.8 },
  },
  {
    id: 'watch-02', source: '/public/media/watch-02.mp4', fps: 25, stillTime: 1,
    headline: ['Engineered', 'to endure.'],
    name: 'Second model', specification: 'Mechanical / Performance', identity: 'Endurance',
    framing: { focus: [51, 48], overscan: 1, macroScale: 5.8 },
  },
];
export const sequence = { dwell: 1, bridge: .8, pixelsPerUnit: 2300, plannedCollectionSize: 3 };
