import { Client } from './Client';

export interface Paged<T> {
  curr: T;
  nextPage: ((client: Client) => Promise<Paged<T>>) | null;
}

// Entities
export interface UserPreview {
  user: User;
  illusts: Array<Illust>;
  novels: Array<Novel>;
  muted: boolean;
}

export interface MyInfo {
  name: string;
  nick: string;
  id: number;
  email: string;
  avatar: {
    big: string;
    medium: string;
    small: string;
  };
}

export interface User {
  id: number;
  accountName: string;
  displayName: string;
  avatar: string;
  description: string | null;
  followed: boolean | null;
}

export interface Work {
  id: number;
  title: string;
  caption: string;
  date: Date;
  user: User;
  pages: number;
  tags: Array<string>;
  thumbnail: string;
  /*
  bookmarks: number | null;
  views: number | null;
  commentCount: number | null;
  */
  bookmarked: boolean;
}

export enum SexualContent {
  None,
  Sexual,
  Grotesque,
}

export interface Illust extends Work {
  type: 'illust' | 'manga' | 'ugoira';
  tools: Array<string>;
  images: Array<string>;
  dimensions: [number, number];
  sexualContent: SexualContent;
}

export interface Novel extends Work {
  length: number;
  series: {
    id: number;
    title: string;
  };
}

export interface Live {
  id: number;
  channelId: string;
  name: string;
  owner: User;
  performers: Array<User>;
  performerCount: number;
  created: Date;
  closed: boolean;
  micEnabled: boolean;
  muted: boolean;
  r15: boolean;
  r18: boolean;
  adult: boolean;
  single: boolean;
  members: number;
  viewers: number;
  mode: 'screencast' | 'webcam';
  server: string;
  thumbnail: string;
}
