// Type thrown in exceptions.
export interface Failure {
  kind: "server" | "parse" | "network" | "client" | "shouldnt-happen";
  msg: string;
}

// Recursive types for paged resources.
// Contains the resource and a Promise to the next page, if any.
export type Paged<T> = [ T, (() => Promise<Paged<T>>) | null ];


export type NextPage<T> = () => Promise<Paged<T>>;


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


export interface Work {
  id: number;
  title: string;
  caption: string;
  date: Date;
  user: User;
  //userId: number;
  pages: number;
  tags: Array<string>;
  thumbnail: string;
/*bookmarks: number | null;
  views: number | null;
  commentCount: number | null;*/
  bookmarked: boolean;
}


export type IllustType = "illust" | "manga" | "ugoira";


export enum SexualContent { None = 1, Sexual, Grotesque }


export enum Restrict { Public, Private };


export interface Illust extends Work {
  type: IllustType;
  tools: Array<string>;
  images: Array<string>;
  dimensions: [number, number];
  sexualContent: SexualContent;
}


export interface User {
  id: number;
  accountName: string;
  displayName: string;
  avatar: string;
  description: string | null;
  followed: boolean | null;
}
