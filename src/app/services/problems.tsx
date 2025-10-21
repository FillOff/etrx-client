"use client";

import { GetProblemsArgs } from "../models/GetProblemsArgs";

export async function getProblems(args: GetProblemsArgs) {
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Problems?` +
      `${args.page != null ? `&page=${args.page}` : ""}` +
      `${args.pageSize != null ? `&pageSize=${args.pageSize}` : ""}` +
      `${args.tags != null ? `&tags=${args.tags.join(";")}` : ""}` +
      `${args.indexes != null ? `&indexes=${args.indexes.join(";")}` : ""}` +
      `${args.problemName != null ? `&problemName=${args.problemName}` : ""}` +
      `${args.minRating != null ? `&minRating=${args.minRating}` : ""}` +
      `${args.maxRating != null ? `&maxRating=${args.maxRating}` : ""}` +
      `${args.minPoints != null ? `&minPoints=${args.minPoints}` : ""}` +
      `${args.maxPoints != null ? `&maxPoints=${args.maxPoints}` : ""}` +
      `${args.sortField != null ? `&sortField=${args.sortField}` : ""}` +
      `${args.sortOrder != null? `&sortOrder=${args.sortOrder}`: "&sortOrder=false"}` +
      `${args.isOnly != null? `&isOnly=${args.isOnly}` : ""}` +
      `${args.lang != null ? `&lang=${args.lang}` : "&lang=ru"}`,
    {
      redirect: "error",
    }
  );
}

export async function getTags() {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/tags`, {
    redirect: "error",
  });
}

export async function getIndexes() {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/indexes`, {
    redirect: "error",
  });
}
