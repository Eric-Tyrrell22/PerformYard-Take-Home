export interface Person {
  name: string;
  musicGenres: string[];
  movies: string[];
  location: string;
  [key: string]: string | string[] | undefined;
}

export type Artists = {
  [genre: string]: string[];
};
