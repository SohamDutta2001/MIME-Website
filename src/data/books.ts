// Books on the shelf at the café. Pulled from the bookshelf at any given time.
// Spine colors are loose suggestions; real books override the value.

export type Book = {
  title: string;
  titleBn?: string;
  author: string;
  spineColor?: string;
  note?: string;
};

export const books: Book[] = [
  { title: 'Pather Panchali', titleBn: 'পথের পাঁচালী', author: 'Bibhutibhushan Bandyopadhyay', spineColor: '#7a4a2a', note: 'Of course.' },
  { title: 'Aranyak', titleBn: 'আরণ্যক', author: 'Bibhutibhushan Bandyopadhyay', spineColor: '#5a6b3e' },
  { title: 'Gora', author: 'Rabindranath Tagore', spineColor: '#3b2418' },
  { title: 'The Home and the World', author: 'Rabindranath Tagore', spineColor: '#a87b4a' },
  { title: 'Chowringhee', author: 'Sankar', spineColor: '#5e3820' },
  { title: 'The Hungry Tide', author: 'Amitav Ghosh', spineColor: '#7a4a2a' },
  { title: 'A Strange and Sublime Address', author: 'Amit Chaudhuri', spineColor: '#6a4729' },
  { title: 'My Days', author: 'R. K. Narayan', spineColor: '#caa173' },
  { title: 'The Lowland', author: 'Jhumpa Lahiri', spineColor: '#3b2418' },
  { title: 'Em and the Big Hoom', author: 'Jerry Pinto', spineColor: '#5a6b3e' },
  { title: 'On Photography', author: 'Susan Sontag', spineColor: '#1c1410' },
  { title: 'Letters to a Young Poet', author: 'Rainer Maria Rilke', spineColor: '#a87b4a' },
];
