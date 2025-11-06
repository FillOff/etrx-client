export interface GroupProtocol {
  handle: string;
  userName: string;
  contestId: number;
  solvedCount: number;
}

export type GroupProtocolForTable = GroupProtocol & { id: string };

export interface HandleContestProtocol {
  index: string,
  participantType: string,
  programmingLanguage: string,
  verdict: string | null
}

export type HandleContestProtocolForTable = HandleContestProtocol & { id: string };