import Pageable from "../models/Pageable";

// While it does not utilize any paging, should have params for it for the future...
export class GetProblemsArgs extends Pageable {
  constructor(
    page: number,
    pageSize: number | null = null,
    sortField: string | null = null,
    sortOrder: boolean | null = true,
    tags: string[] | null = [],
    indexes: string[] | null = [],
    divisions: string[] | null = [],
    problemName: string,
    minRating: number,
    maxRating: number | undefined,
    minPoints: number,
    maxPoints: number | undefined,
    minSolved: number,
    maxSolved: number | undefined,
    minDifficulty: number,
    maxDifficulty: number | undefined,
    isOnly: boolean = false,
    lang: string | null
  ) {
    super(page, pageSize, sortField, sortOrder);
    this.tags = tags;
    this.indexes = indexes;
    this.divisions = divisions;
    this.problemName = problemName;
    this.minRating = minRating;
    this.maxRating = maxRating;
    this.minPoints = minPoints;
    this.maxPoints = maxPoints;
    this.minSolved = minSolved;
    this.maxSolved = maxSolved;
    this.minDifficulty = minDifficulty;
    this.maxDifficulty = maxDifficulty;
    this.isOnly = isOnly;
    this.lang = lang;
  }

  tags: string[] | null;
  indexes: string[] | null;
  divisions: string[] | null;
  problemName: string;
  minRating: number;
  maxRating: number | undefined;
  minPoints: number;
  maxPoints: number | undefined;
  minSolved: number;
  maxSolved: number | undefined;
  minDifficulty: number;
  maxDifficulty: number | undefined;
  isOnly: boolean;
  lang: string | null;
}
