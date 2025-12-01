"use client";

import { GetProblemsArgs } from "../models/GetProblemsArgs";

export async function getProblems(args: GetProblemsArgs) {
  const queryParams = new URLSearchParams();

  queryParams.append("page", (args.page ?? 1).toString());
  queryParams.append("pageSize", (args.pageSize ?? 100).toString());
  queryParams.append("sortOrder", (args.sortOrder ?? false).toString());
  queryParams.append("isOnly", (args.isOnly ?? false).toString());
  queryParams.append("lang", args.lang ?? "ru");

  if (args.sortField != null) queryParams.append("sortField", args.sortField);  
  if (args.tags != null) queryParams.append("tags", args.tags.join(";"));
  if (args.indexes != null) queryParams.append("indexes", args.indexes.join(";"));
  if (args.problemName != null) queryParams.append("problemName", args.problemName);
  if (args.minRating != null) queryParams.append("minRating", args.minRating.toString());
  if (args.maxRating != null) queryParams.append("maxRating", args.maxRating.toString());
  if (args.minPoints != null) queryParams.append("minPoints", args.minPoints.toString());
  if (args.maxPoints != null) queryParams.append("maxPoints", args.maxPoints.toString());
  if (args.minDifficulty != null) queryParams.append("minDifficulty", args.minDifficulty.toString());
  if (args.maxDifficulty != null) queryParams.append("maxDifficulty", args.maxDifficulty.toString());

  if (args.divisions && args.divisions.length > 0) {
    args.divisions.forEach(division => queryParams.append("divisions", division));
  }
  
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Problems?${queryParams.toString()}`,
    {
      redirect: "error",
    }
  );
}

export async function getTags(params?: {
  minRating?: number;
  maxRating?: number;
}) {
  const query = new URLSearchParams();
  if (params?.minRating !== undefined)
    query.append("minRating", params.minRating.toString());
  if (params?.maxRating !== undefined)
    query.append("maxRating", params.maxRating.toString());
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Problems/tags?${query.toString()}`,
    {
      redirect: "error",
    }
  );
}

export async function getIndexes() {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/indexes`, {
    redirect: "error",
  });
}
