// Intentionally minimal. Add fields as needed (e.g. featured, orientation)
// without breaking existing consumers — all fields beyond src/alt are optional.
export type GalleryPhoto = {
  src: string;      // filename in public/cafe-assets/
  alt: string;      // descriptive alt text
  caption?: string; // short display caption — example copy, not immutable
};

export const firstStagePhotos: GalleryPhoto[] = [
  {
    src: 'mime-first-stage-stage-moment.webp',
    alt: 'Two children performing on a theatre stage under blue dramatic lighting',
    caption: 'On stage · First Bell',
  },
  {
    src: 'mime-first-stage-face-paint.webp',
    alt: 'A child with colourful face paint in character before a performance',
    caption: 'Before the curtain · character in the making',
  },
  {
    src: 'mime-first-stage-ribbons.webp',
    alt: 'A large ensemble of children performing with coloured ribbons under stage lighting',
    caption: 'Colour and choreography',
  },
  {
    src: 'mime-first-stage-dark-dance.webp',
    alt: 'Children dancing on a dark stage during a movement workshop',
    caption: 'Movement workshop · Saturdays',
  },
  {
    src: 'mime-first-stage-clay-hands.webp',
    alt: "Children's hands working with clay in an art and craft session",
    caption: 'Hands in clay · art & craft session',
  },
  {
    src: 'mime-first-stage-full-production.webp',
    alt: 'A full stage production with professional lighting at the annual Durga Puja showcase',
    caption: 'Annual showcase · Durga Puja',
  },
];

export const workshopPhotos: GalleryPhoto[] = [
  {
    src: 'mime-workshop-drawing-guidance.webp',
    alt: 'An instructor guiding a student drawing a horse on paper',
    caption: 'Drawing · with guidance',
  },
  {
    src: 'mime-workshop-circle-discussion.webp',
    alt: 'Participants sitting in a circle on the floor with a facilitator',
    caption: 'Learning in circle',
  },
  {
    src: 'mime-workshop-community-gathering.webp',
    alt: 'A community workshop group with Bengali signage visible behind the instructor',
    caption: 'Community workshop',
  },
  {
    src: 'mime-workshop-group-movement.webp',
    alt: 'A group of participants practising acrobatic movement together on the floor',
    caption: 'Body movement · ensemble',
  },
  {
    src: 'mime-workshop-acrobatics.webp',
    alt: 'Physical theatre training — participants in movement and acrobatic exercise',
    caption: 'Physical theatre training',
  },
  {
    src: 'mime-performance-outdoor-festival.webp',
    alt: 'Performers in traditional costumes doing acrobatics at an outdoor festival',
    caption: 'Outdoor festival · in the city',
  },
  {
    src: 'mime-performance-vw-festival.webp',
    alt: 'Performers in patchwork costumes at an outdoor festival, a VW Beetle visible behind',
    caption: 'The city as stage',
  },
];

export const performancePhotos: GalleryPhoto[] = [
  {
    src: 'mime-performance-duo-costume.webp',
    alt: 'Two MIME performers in elaborate costumes against a dark background',
    caption: 'The space in use',
  },
  {
    src: 'mime-performance-ensemble-stage.webp',
    alt: 'A full ensemble on stage under warm orange and red theatrical lighting',
    caption: 'Ensemble · full stage',
  },
  {
    src: 'mime-performance-aerial-blue.webp',
    alt: 'An aerial performer under dramatic purple and blue stage lighting',
    caption: 'Aerial · dramatic light',
  },
];
