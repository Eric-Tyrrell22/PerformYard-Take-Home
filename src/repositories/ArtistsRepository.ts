import type { Artists } from '@/types';
import { searchArrayField } from '@/utils/searchUtils';

export class ArtistsRepository {
  private artists: Artists = {};

  constructor(artistsData: Artists) {
    this.artists = artistsData;
  }

  /**
   * Adds a new artist to a specific genre
   * @param genre The music genre
   * @param artist The artist name to add
   */
  add(genre: string, artist: string): void {
    if (!this.artists[genre]) {
      this.artists[genre] = [];
    }
    if (!this.artists[genre].includes(artist)) {
      this.artists[genre].push(artist);
    }
  }


  searchByGenre(genre: string, query: string): boolean {
    if (!this.artists[genre]) {
      return false;
    }
    return searchArrayField(query, this.artists[genre]);
  }
}
