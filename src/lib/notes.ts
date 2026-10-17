import { getCollection, type CollectionEntry } from 'astro:content';
import { notesConfig } from '@config/notes';
import { markdownToSearchText } from './search';
import { selectNotes } from './note-list';

export type Note = CollectionEntry<'notes'>;

export async function getPublishedNotes(): Promise<Note[]> {
  const notes = await getCollection('notes');
  return selectNotes(notes, import.meta.env.DEV && notesConfig.includeDraftsInDevelopment);
}

export function getNoteHref(note: Note): string {
  return `${notesConfig.route}${note.id}/`;
}

export function getNoteSummary(note: Note): string {
  return markdownToSearchText(note.body ?? '').slice(0, 180);
}

export function getNoteTitle(note: Note): string {
  return note.data.title ?? (getNoteSummary(note).slice(0, 42) || notesConfig.untitledLabel);
}
