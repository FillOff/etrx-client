"use client";

import { GetProblemsArgs } from "../models/GetProblemsArgs";

export async function getProblems(args: GetProblemsArgs) {
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Problems?` +
      `${args.page != null ? `&page=${args.page}` : ""}` +
      `${args.pageSize != null ? `&pageSize=${args.pageSize}` : ""}` +
      `${args.tags != null ? `&tags=${args.tags.join(";")}` : ""}` +
      `${args.indexes != null ? `&indexes=${args.indexes.join(";")}` : ""}` +
      `${args.divisions ? args.divisions.map(d => `&divisions=${d}`).join("") : ""}` +
      `${args.problemName != null ? `&problemName=${args.problemName}` : ""}` +
      `${args.minRating != null ? `&minRating=${args.minRating}` : ""}` +
      `${args.maxRating != null ? `&maxRating=${args.maxRating}` : ""}` +
      `${args.minPoints != null ? `&minPoints=${args.minPoints}` : ""}` +
      `${args.maxPoints != null ? `&maxPoints=${args.maxPoints}` : ""}` +
      `${args.minSolved != null ? `&minSolved=${args.minSolved}` : ""}` +
      `${args.maxSolved != null ? `&maxSolved=${args.maxSolved}` : ""}` +
      `${args.minDifficulty != null ? `&minDifficulty=${args.minDifficulty}` : ""}` +
      `${args.maxDifficulty != null ? `&maxDifficulty=${args.maxDifficulty}` : ""}` +
      `${args.sortField != null ? `&sortField=${args.sortField}` : ""}` +
      `${args.sortOrder != null ? `&sortOrder=${args.sortOrder}` : "&sortOrder=false"}` +
      `${args.isOnly != null ? `&isOnly=${args.isOnly}` : ""}` +
      `${args.lang != null ? `&lang=${args.lang}` : "&lang=ru"}`,
    {
      redirect: "error",
    }
  );
}

export async function getTags(params?: { minRating?: number; maxRating?: number }) {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Problems/tags?` +
      `${params?.minRating != null ? `&minRating=${params.minRating}` : ""}` +
      `${params?.maxRating != null ? `&maxRating=${params.maxRating}` : ""}`,
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
