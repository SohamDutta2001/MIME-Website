// Photo manifest — single source of truth for every photo on the site.
// Replace placeholders by dropping a real JPEG into photos/ with the same
// base name, then change the import here from `_placeholder-*.svg`
// to the new file. Astro's <Image> handles the rest.

import landscape from '../../photos/_placeholder-landscape.svg';
import portrait from '../../photos/_placeholder-portrait.svg';
import square from '../../photos/_placeholder-square.svg';
import mapSketch from '../../photos/map-sketch.svg';
import signature from '../../photos/signature.svg';

export const photos = {
  hero: landscape,

  experience: {
    cha: landscape,
    books: landscape,
    smoke: landscape,
    hours: landscape,
  },

  bookshelf: landscape,
  bookCover: portrait,

  gallery: [
    { src: portrait, alt: 'A cup of cha on a wooden table at dusk', orient: 'portrait' as const },
    { src: landscape, alt: 'Two friends mid-conversation, leaning across the table', orient: 'landscape' as const },
    { src: square, alt: 'Hand-bound notebook open beside a steaming kettle', orient: 'square' as const },
    { src: portrait, alt: 'Bookshelf, late afternoon light through warm windows', orient: 'portrait' as const },
    { src: landscape, alt: 'Empty chairs, paper lamps, the cafe in stillness', orient: 'landscape' as const },
    { src: square, alt: 'A reader, alone, in the quiet corner', orient: 'square' as const },
    { src: portrait, alt: 'Kettle, tea leaves, condensation on a glass jar', orient: 'portrait' as const },
    { src: landscape, alt: 'A long table during a poetry evening', orient: 'landscape' as const },
    { src: square, alt: 'Detail of a hand turning a page of an old paperback', orient: 'square' as const },
    { src: portrait, alt: 'A regular reading the newspaper, his usual chair', orient: 'portrait' as const },
    { src: landscape, alt: 'The street outside, monsoon evening, the sign glowing warm', orient: 'landscape' as const },
    { src: square, alt: 'A closed book on a checkered tablecloth', orient: 'square' as const },
  ],

  mapSketch,
  signature,
} as const;

export type Photo = typeof photos.gallery[number];
