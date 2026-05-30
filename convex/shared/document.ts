export interface Session {
  sessionId: string;
  lastUpdatedAt: number;
}

export interface Document {
  id: string;
  creationTime: number;
  userId: string;
  title: string;
  content: string;
  activeStreamId?: string;
  activeSession?: Session;
}
