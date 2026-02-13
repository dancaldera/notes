export interface Note {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDTO {
  title: string;
  content?: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
}
