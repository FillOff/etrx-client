"use client";

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useIsClient } from "@/hooks/useIsClient";
import { useQueryState } from "@/hooks/useQueryState";
import { getProblems } from "@/app/services/problems";
import { GetProblemsArgs } from "../models/GetProblemsArgs";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { Table } from "@/app/components/Table";
import { TagsFilter } from "@/app/components/tags-filter";
import { GetDivTagsList } from "@/app/components/problem-tags";
import { Column, SortOrder } from "@/app/models/TableTypes";
import { Problem, ProblemForTable } from "@/app/models/Problem";

const DEFAULT_PAGE = 1;
const DEFAULT_SORT_FIELD: keyof Problem = "contestId";
const DEFAULT_SORT_ORDER: SortOrder = "desc";
const DEFAULT_TAGS: string[] = [];
const DEFAULT_INDEXES: string[] = [];
const DEFAULT_PROBLEM_NAME = "";
const DEFAULT_MIN_RATING = 0;
const DEFAULT_MAX_RATING = 10000;
const DEFAULT_MIN_POINTS = 0;
const DEFAULT_MAX_POINTS = 10000;
const DEFAULT_MIN_DIFFICULTY = 0;
const DEFAULT_MAX_DIFFICULTY = 10000;
const DEFAULT_IS_ONLY = true;

function ProblemClientPage() {
  const { t, i18n } = useTranslation("problem");
  const isClient = useIsClient();

  const { searchParams, setQueryParams } = useQueryState({
    page: DEFAULT_PAGE,
    sortField: DEFAULT_SORT_FIELD,
    sortOrder: DEFAULT_SORT_ORDER,
    tags: DEFAULT_TAGS.join(","),
    indexes: DEFAULT_INDEXES.join(","),
    problemName: DEFAULT_PROBLEM_NAME,
    minRating: DEFAULT_MIN_RATING,
    maxRating: DEFAULT_MAX_RATING,
    minPoints: DEFAULT_MIN_POINTS,
    maxPoints: DEFAULT_MAX_POINTS,
    minDifficulty: DEFAULT_MIN_DIFFICULTY,
    maxDifficulty: DEFAULT_MAX_DIFFICULTY,    
    isOnly: DEFAULT_IS_ONLY,
  });

  const page = useMemo(() => Number(searchParams.get("page")) || DEFAULT_PAGE, [searchParams]);
  const sortField = useMemo(() => (searchParams.get("sortField") as keyof Problem) || DEFAULT_SORT_FIELD, [searchParams]);
  const sortOrder = useMemo(() => (searchParams.get("sortOrder") as SortOrder) || DEFAULT_SORT_ORDER, [searchParams]);
  const problemName = useMemo(() => searchParams.get("problemName") || DEFAULT_PROBLEM_NAME, [searchParams]);
  const minRating = useMemo(() => Number(searchParams.get("minRating")) || DEFAULT_MIN_RATING, [searchParams]);
  const maxRating = useMemo(() => Number(searchParams.get("maxRating")) || DEFAULT_MAX_RATING, [searchParams]);
  const minPoints = useMemo(() => Number(searchParams.get("minPoints")) || DEFAULT_MIN_POINTS, [searchParams]);
  const maxPoints = useMemo(() => Number(searchParams.get("maxPoints")) || DEFAULT_MAX_POINTS, [searchParams]);
  const minDifficulty = useMemo(() => Number(searchParams.get("minDifficulty")) || DEFAULT_MIN_DIFFICULTY, [searchParams]);
  const maxDifficulty = useMemo(() => Number(searchParams.get("maxDifficulty")) || DEFAULT_MAX_DIFFICULTY, [searchParams]);
  const isOnly = useMemo(() => searchParams.get("isOnly") === "true", [searchParams]);

  const selectedTags = useMemo(() => {
    const tagsParam = searchParams.get("tags");
    return tagsParam ? tagsParam.split(",") : DEFAULT_TAGS;
  }, [searchParams]);
  const indexes = useMemo(() => {
    const indexesParam = searchParams.get("indexes");
    return indexesParam ? indexesParam.split(",") : DEFAULT_INDEXES;
  }, [searchParams]);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const args = new GetProblemsArgs(
      page,
      100,
      sortField,
      sortOrder === "asc",
      selectedTags,
      indexes,
      problemName,
      minRating,
      maxRating,
      minPoints,
      maxPoints,
      minDifficulty,
      maxDifficulty,
      isOnly,
      i18n.language
    );

    try {
      const response = await getProblems(args);
      if (!isMounted.current) return;
      if (!response.ok)
        throw new Error(t("common:error", { statusCode: response.status }));

      const data = await response.json();
      setProblems(data.problems || []);
      setMaxPage(data.pageCount || 1);
    } catch (err) {
      if (!isMounted.current) return;
      setError(err as Error);
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  }, [page, sortField, sortOrder, selectedTags, indexes, problemName, minRating, maxRating, minPoints, maxPoints, minDifficulty, maxDifficulty, isOnly,
    i18n.language, t]);

  useEffect(() => {
    isMounted.current = true;
    if (isClient) {
      fetchProblems();
    }
    return () => {
      isMounted.current = false;
    };
  }, [isClient, fetchProblems]);

  const handleSortChange = (newSortField: keyof ProblemForTable) => {
    const effectiveSortField = newSortField as keyof Problem;
    const newSortOrder =
      sortField === effectiveSortField && sortOrder === "asc" ? "desc" : "asc";

    setQueryParams({
      sortField: effectiveSortField,
      sortOrder: newSortOrder,
      page: 1,
    });
  };

  const handleFilterChange = (paramName: string, value: any) => {
    const paramValue = Array.isArray(value) ? value.join(",") : value;
    setQueryParams({
      [paramName]: paramValue,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams({ page: newPage });
  };

  const columns: Column<ProblemForTable>[] = useMemo(
    () => [
      { key: "contestId", header: t("problem:tableHeaders.contest"), accessor: "contestId" },
      { key: "index", header: t("problem:tableHeaders.index"), accessor: "index" },
      { key: "name", header: t("problem:tableHeaders.name"), accessor: "name" },
      { key: "points", header: t("problem:tableHeaders.points"), accessor: "points" },
      { key: "rating", header: t("problem:tableHeaders.rating"), accessor: "rating" },
      { key: "difficulty", header: t("problem:tableHeaders.difficulty"), accessor: "difficulty" },
      {
        key: "tags",
        header: t("problem:tableHeaders.tags"),
        accessor: "tags",
        render: (problem) => GetDivTagsList(problem.tags),
        isSortable: false,
      },
    ],
    [t]
  );

  const tableData: ProblemForTable[] = problems.map((problem) => ({
    ...problem,
    id: `${problem.contestId}-${problem.index}`,
  }));

  if (!isClient) {
    return <GizmoSpinner />;
  }

  return (
    <>
      <h1 className="text-3xl w-full text-center font-bold mb-5">
        {t("problem:problemsTableTitle")}
      </h1>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-4">
        <div className="col-start-1 flex justify-center">
          <button
            className="px-2 py-2 bg-blue-500 text-white rounded self-center"
            onClick={() => {
              setQueryParams({
                isOnly: !isOnly,
                page: 1,
              });
            }}
          >
            {isOnly ? "isOnly = true" : "isOnly = false"}
          </button>
        </div>

        <div className="col-start-2">
          <TagsFilter
            selectedTags={selectedTags}
            onSelectedTagsChange={(value) => handleFilterChange("tags", value)}
            selectedIndexes={indexes}
            onSelectedIndexesChange={(value) =>
              handleFilterChange("indexes", value)
            }
            problemName={problemName}
            onProblemNameChange={(value) =>
              handleFilterChange("problemName", value)
            }
            minRating={minRating}
            onMinRatingChange={(value) =>
              handleFilterChange("minRating", value)
            }
            maxRating={maxRating}
            onMaxRatingChange={(value) =>
              handleFilterChange("maxRating", value)
            }
            minPoints={minPoints}
            onMinPointsChange={(value) =>
              handleFilterChange("minPoints", value)
            }
            maxPoints={maxPoints}
            onMaxPointsChange={(value) =>
              handleFilterChange("maxPoints", value)
            }
            minDifficulty={minDifficulty}
            onMinDifficultyChange={(value) =>
              handleFilterChange("minDifficulty", value)
            }
            maxDifficulty={maxDifficulty}
            onMaxDifficultyChange={(value) =>
              handleFilterChange("maxDifficulty", value)
            }
          />
        </div>

        <div className="col-start-3" />
      </div>

      <Table
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        error={error}
        page={page}
        maxPage={maxPage}
        onPageChange={handlePageChange}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRowClick={(problem) =>
          window.open(
            `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
          )
        }
      />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <ProblemClientPage />
    </Suspense>
  );
}
