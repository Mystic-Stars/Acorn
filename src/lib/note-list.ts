interface NoteEntry {
  id: string;
  data: { pubDate: Date; draft?: boolean };
}

/** Only an explicit development policy may include drafts. Feeds filter independently. */
export function selectNotes<T extends NoteEntry>(notes: T[], includeDrafts = false): T[] {
  for (const note of notes) {
    if (note.id === 'rss' || note.id === 'page' || note.id.startsWith('page/'))
      throw new Error(`${note.id}: note ID conflicts with a reserved route`);
  }
  return notes
    .filter((note) => includeDrafts || !note.data.draft)
    .sort(
      (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id),
    );
}

export function getNoteAnchor(id: string): string {
  return `note-${id}`;
}
