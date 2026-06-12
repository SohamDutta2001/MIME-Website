export const site = {
  name: 'Art Teas Tree Cafe',
  tagline: 'Where conversations steep slowly.',
  accent: 'Adda. Art. Tea.',
  description:
    'A Kolkata café reimagining the roadside cha er dokan as an artistic social space. Books, tea, conversation, and the slow art of adda. Associated with the Mime Institute of Calcutta.',
  philosophy: 'Human connection over digital isolation.',
  bengali: {
    adda: 'আড্ডা',
    cha: 'চা',
    closing: 'শেষ নোয়... আরো এক কাপ চা?',
  },
  location: {
    line1: '14B College Street',
    line2: 'Kolkata, West Bengal 700073',
    note: 'Three minutes from Presidency, ten minutes from Coffee House.',
  },
  hours: [
    { days: 'Mon — Thu', time: '10:00 — 22:00' },
    { days: 'Fri — Sat', time: '10:00 — 23:30' },
    { days: 'Sunday', time: '12:00 — 22:00' },
  ],
  contact: {
    phone: '+91 33 0000 0000',
    email: 'hello@artteastreecafe.com',
    instagram: '@artteastree',
    instagramUrl: 'https://instagram.com/artteastree',
  },
  affiliation: {
    name: 'Mime Institute of Calcutta',
    note: 'A long shared lineage of theatre, performance, and the slow ritual of adda.',
  },
} as const;

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/menu', label: 'Menu' },
] as const;
