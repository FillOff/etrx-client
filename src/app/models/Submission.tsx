export interface SubmissionProtocol {
  userName: string;
  contestId: number;
  solvedCount: number;
}

export type ProtocolForTable = SubmissionProtocol & { id: string };