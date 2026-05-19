// Data only used by the mockup deck at /mockups.
// Kept separate from the real mockArtistData.json so we can show a richer
// directory (12+ artists) without bloating the live cafe site, and so the
// chat conversations live next to the artists they reference.

// All images reuse the four cafe photos that already exist on disk.
const PHOTOS = {
  one: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp',
  two: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-fzkrcnggvx.webp',
  three: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-h3gejc5rf6-250.jpg',
  four: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-lxs22xc0rr-250.webp',
};

export const MOCKUP_ARTISTS = [
  {
    id: 1,
    slug: 'anirban-chatterjee',
    name: 'Anirban Chatterjee',
    craft: 'Mime',
    tags: ['Movement', 'Physical Theatre'],
    languages: ['Bengali', 'English', 'Hindi'],
    location: 'Kolkata',
    available: 'December',
    bio: 'A silent performer from the Mime Institute circle, interested in everyday gestures and street memories. Twelve years on stage, three years teaching.',
    imageUrl: PHOTOS.one,
  },
  {
    id: 2,
    slug: 'mrittika-sen',
    name: 'Mrittika Sen',
    craft: 'Poet',
    tags: ['Spoken Word', 'Bilingual'],
    languages: ['Bengali', 'English'],
    location: 'Kolkata',
    available: 'November',
    bio: 'Writes small poems about buses, rainwater, old para balconies, and the difficult art of staying human.',
    imageUrl: PHOTOS.two,
  },
  {
    id: 3,
    slug: 'ritwik-basu',
    name: 'Ritwik Basu',
    craft: 'Musician',
    tags: ['Guitar', 'Bengali Folk', 'Blues'],
    languages: ['Bengali', 'English'],
    location: 'Kolkata',
    available: 'December',
    bio: 'Plays Bengali folk, blues, and half-remembered songs that somehow everyone knows by the chorus.',
    imageUrl: PHOTOS.three,
  },
  {
    id: 4,
    slug: 'farah-naaz',
    name: 'Farah Naaz',
    craft: 'Storyteller',
    tags: ['Spoken Theatre', 'Oral History'],
    languages: ['Urdu', 'Hindi', 'Bengali'],
    location: 'Howrah',
    available: 'January',
    bio: 'Collects neighbourhood stories and performs them as intimate spoken-word theatre. Often unannounced, always remembered.',
    imageUrl: PHOTOS.four,
  },
  {
    id: 5,
    slug: 'sohini-dey',
    name: 'Sohini Dey',
    craft: 'Illustrator',
    tags: ['Watercolour', 'Reportage', 'Live Sketching'],
    languages: ['Bengali', 'English'],
    location: 'Salt Lake',
    available: 'Ongoing',
    bio: 'Sketches teacups, tram lines, theatre masks, and other proof that a city remembers itself in pencil.',
    imageUrl: PHOTOS.one,
  },
  {
    id: 6,
    slug: 'abhirup-ghosh',
    name: 'Abhirup Ghosh',
    craft: 'Photographer',
    tags: ['Street', 'Black & White'],
    languages: ['English', 'Bengali'],
    location: 'New Town',
    available: 'December',
    bio: 'Photographs strangers like they are old friends. Twenty years walking Kolkata at dawn.',
    imageUrl: PHOTOS.two,
  },
  {
    id: 7,
    slug: 'tanisha-roy',
    name: 'Tanisha Roy',
    craft: 'Dancer',
    tags: ['Kathak', 'Contemporary'],
    languages: ['Bengali', 'Hindi', 'English'],
    location: 'Bidhan Nagar',
    available: 'January',
    bio: 'Trained in Kathak for fourteen years, now exploring what happens when the form meets contemporary stage design.',
    imageUrl: PHOTOS.three,
  },
  {
    id: 8,
    slug: 'imran-haque',
    name: 'Imran Haque',
    craft: 'Musician',
    tags: ['Sitar', 'Indo-jazz'],
    languages: ['Urdu', 'Bengali', 'English'],
    location: 'Park Circus',
    available: 'November',
    bio: 'Sitarist who plays in cafes more often than concert halls — claims the acoustics of bhar and steel are honest.',
    imageUrl: PHOTOS.four,
  },
  {
    id: 9,
    slug: 'paroma-mitra',
    name: 'Paroma Mitra',
    craft: 'Theatre',
    tags: ['Director', 'Adapter'],
    languages: ['Bengali', 'English'],
    location: 'Jadavpur',
    available: 'February',
    bio: 'Directs small-stage Bengali adaptations of Chekhov, Beckett, and her grandmother’s diary. Has staged six plays at the cafe.',
    imageUrl: PHOTOS.one,
  },
  {
    id: 10,
    slug: 'kabir-sharma',
    name: 'Kabir Sharma',
    craft: 'Poet',
    tags: ['Hindi', 'Page Poetry'],
    languages: ['Hindi', 'English'],
    location: 'Salt Lake',
    available: 'Ongoing',
    bio: 'Writes Hindi poems that quote Faiz, Ghalib, and Tinder bios in the same breath. Reads slowly, on purpose.',
    imageUrl: PHOTOS.two,
  },
  {
    id: 11,
    slug: 'devika-iyer',
    name: 'Devika Iyer',
    craft: 'Filmmaker',
    tags: ['Documentary', 'Short film'],
    languages: ['English', 'Tamil', 'Bengali'],
    location: 'Kolkata',
    available: 'December',
    bio: 'Documents the unphotographed Kolkata. Two festival shorts. Currently filming a piece about cha er dokan owners.',
    imageUrl: PHOTOS.three,
  },
  {
    id: 12,
    slug: 'arpita-banerjee',
    name: 'Arpita Banerjee',
    craft: 'Mime',
    tags: ['Solo', 'Children’s theatre'],
    languages: ['Bengali', 'English'],
    location: 'Behala',
    available: 'November',
    bio: 'Performs solo mime for adults and children. Trained under the Mime Institute since age seventeen.',
    imageUrl: PHOTOS.four,
  },
];

// Filters and crafts derived from the artist roster, for the directory header.
export const MOCKUP_CRAFTS = [
  'All',
  'Mime',
  'Poet',
  'Musician',
  'Storyteller',
  'Illustrator',
  'Photographer',
  'Dancer',
  'Theatre',
  'Filmmaker',
];

// One artist used in the profile mockup. We pick Anirban because the chat
// conversation also routes to him — the mockups read as a single story.
export const MOCKUP_FEATURED_ARTIST = MOCKUP_ARTISTS[0];

// ---------------------------------------------------------------------------
// Chat scripts. Each script is an ordered list of messages between a visitor
// ("user") and the cafe's AI concierge ("bot"). The chat widget renders them
// in order with cinematic typing pauses. `attachments` lets the bot surface
// artist cards inline.
// ---------------------------------------------------------------------------

export const CHAT_BOOKING_SCRIPT = {
  id: 'booking',
  title: 'Artist booking flow',
  language: 'English',
  messages: [
    {
      from: 'bot',
      text: "Hi — I'm the cafe's concierge. Looking for tea, a table, or someone to perform? Tell me what you need.",
    },
    {
      from: 'user',
      text: "I need a mime artist for a corporate Diwali event in late October. Indoor, about 150 people, one hour evening slot.",
    },
    {
      from: 'bot',
      text: "Lovely — we have three mime artists in residence who handle corporate audiences. Two of them are free on the dates you'd want. Let me show you.",
    },
    {
      from: 'bot',
      attachments: [
        {
          name: 'Anirban Chatterjee',
          craft: 'Mime · Physical Theatre',
          available: 'Free Oct 24, 25, 27',
          bio: '12 years on stage. Has done four corporate shows for tech companies in Salt Lake.',
        },
        {
          name: 'Arpita Banerjee',
          craft: 'Mime · Solo',
          available: 'Free Oct 26, 28',
          bio: 'Trained at the Mime Institute. Strong with mixed audiences (adults + family).',
        },
      ],
    },
    {
      from: 'user',
      text: "Tell me more about Anirban.",
    },
    {
      from: 'bot',
      text: "Anirban has performed for Wipro, Tata Steel, and a Diwali show for ITC last year (150-person audience, very similar to yours). His Oct 24 slot is open. Indicative fee for a one-hour corporate set: ₹18,000 to ₹25,000 depending on staging needs. He'll quote the exact number after a short call.",
    },
    {
      from: 'user',
      text: "Perfect. Can you forward this to him? My email is priya@example.com",
    },
    {
      from: 'bot',
      text: "Done — Anirban will reply within 24 hours. I've also pencilled Oct 24 as a tentative hold on his calendar. The cafe owner has been copied so they know your event is in the works.",
      tag: 'lead-captured',
    },
  ],
};

export const CHAT_CULTURAL_SCRIPT = {
  id: 'cultural',
  title: 'Multilingual cultural concierge',
  language: 'Bengali → English',
  messages: [
    {
      from: 'user',
      text: 'আড্ডা কী?',
    },
    {
      from: 'bot',
      text: 'আড্ডা একটা বাঙালি সংস্কৃতি — নিরুদ্দেশ্য, সময়হীন কথোপকথন। চায়ের দোকানে, বন্ধুদের সাথে, বিকেলে। এই ক্যাফে তাই আড্ডা একটা সংস্কৃতি, বিক্ষেপ নয়।',
    },
    {
      from: 'user',
      text: 'And what about lyadh?',
    },
    {
      from: 'bot',
      text: "Lyadh is the Kolkata Bengali word for productive idleness. Not laziness — the slow afternoon that turns into the right idea. Stay for the second cup. That is lyadh.",
    },
    {
      from: 'user',
      text: 'I want to come on a Saturday — are the artists usually there?',
    },
    {
      from: 'bot',
      text: 'Most Saturdays an artist drops by between 5pm and 8pm — it’s when the rehearsal crowd shows up. This week, Mrittika Sen is reading new poems on Saturday at 6:30pm. Free entry. Want me to save you a table?',
    },
  ],
};

export const CHAT_MENU_SCRIPT = {
  id: 'menu',
  title: 'Menu Q&A',
  language: 'English',
  messages: [
    {
      from: 'user',
      text: "What's vegan on your menu?",
    },
    {
      from: 'bot',
      text: "Three things are fully vegan today — Lebu Cha (₹30), Adrak Cha (₹35), and the Telebhaja Plate (₹65). The Adda Cold Brew (₹95) is vegan if you skip the optional jaggery foam.",
    },
    {
      from: 'user',
      text: "Anything without caffeine for a 9-year-old?",
    },
    {
      from: 'bot',
      text: 'Tulsi Malai Cha can be made caffeine-free — we swap the black tea base for plain holy basil and warm milk (₹45). The Banana Cake (₹80) is also a safe bet and pairs beautifully with it.',
    },
    {
      from: 'user',
      text: 'Do you have a kids menu in print?',
    },
    {
      from: 'bot',
      text: "Not in print — but I'm noting your interest for the owner. If you tell me your email I'll send you a one-pager of kid-friendly picks before your visit.",
    },
  ],
};
