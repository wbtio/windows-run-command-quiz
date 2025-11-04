
export interface Command {
  command: string;
  description_ar: string;
  description_en: string;
}

export enum GameState {
  Start,
  Playing,
  Finished,
  CommandList,
}

export enum AnswerFeedback {
    None,
    Correct,
    Incorrect
}