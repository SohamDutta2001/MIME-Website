export const site = {
  name: 'Art Teas Tree Cafe',
  tagline: 'Where conversations steep slowly.',
  accent: 'Adda. Art. Tea.',
  description:
    'A cosy cafe in Salt Lake, Kolkata reimagining the roadside cha er dokan as an artistic social space — tea, coffee, books, and the slow art of adda. Associated with the National Mime Institute.',
  philosophy: 'Human connection over digital isolation.',
  bengali: {
    adda: 'আড্ডা',
    cha: 'চা',
    closing: 'শেষ নোয়... আরো এক কাপ চা?',
  },
  location: {
    line1: 'CK-7, CK Block, Sector II',
    line2: 'Salt Lake City, Bidhannagar, Kolkata, West Bengal 700091',
    note: 'In the heart of Salt Lake — Sector II, Bidhannagar.',
    // Structured fields for local SEO / schema.org PostalAddress.
    streetAddress: 'CK-7, CK Block, Sector II, Salt Lake City',
    locality: 'Bidhannagar, Kolkata',
    region: 'West Bengal',
    postalCode: '700091',
    country: 'IN',
  },
  hours: [
    { days: 'Daily', time: '5:00 PM — 10:00 PM' },
  ],
  contact: {
    phone: '+91 33 0000 0000',
    email: 'Art.teas.tree.cafe@gmail.com',
    instagram: '@art_teas_tree_cafe',
    instagramUrl: 'https://www.instagram.com/art_teas_tree_cafe',
    facebookUrl: 'https://www.facebook.com/people/Art-Teas-Tree-Caf%C3%A9/61589309727983/?rdid=0qt6N2u5LwZDVoFJ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DKrCGpMdf%2F',
  },
  affiliation: {
    name: 'National Mime Institute',
    url: 'https://nationalmimeinstitute.in/',
    note: 'A long shared lineage of theatre, performance, and the slow ritual of adda.',
  },
} as const;

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/#menu', label: 'Menu' },
] as const;
