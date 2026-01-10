export interface FilterBounds {
  availableTags: string[];
  availableIndexes: string[];
  availableDivisions: string[];
  availableRanks: string[];
  minRating: number;
  maxRating: number;
  minPoints: number;
  maxPoints: number;
  minSolved: number;
  maxSolved: number;
  minDifficulty: number;
  maxDifficulty: number;
}

export interface FilterBoundsResponse {
  totalBounds: FilterBounds;
  currentFilters: Partial<FilterBounds>;
}
