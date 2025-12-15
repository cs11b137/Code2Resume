export type Language = 'zh' | 'en';
export type Style = 'aggressive' | 'balanced' | 'conservative';

export type GenerateRequestBody = {
  projectName: string;
  techStack?: string;
  material: string;
  count?: number;
  language?: Language;
  style?: Style;
};

export type Star = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

export type GenerateResponseBody = {
  bullets: string[];
  stars: Star[];
  skills: string[];
  metrics: string[];
  risks: string[];
  assumptions: string[];
  missing_info_questions: string[];
  meta: {
    language: Language;
    style: Style;
    createdAt: string;
    model: string;
    mockMode: boolean;
  };
};

export type ApiErrorBody = {
  error: string;
  message: string;
  hint?: string;
};

export type FetchMaterialRequestBody = {
  repo: string;
  token?: string;
  commitCount?: number;
  prCount?: number;
};

export type FetchMaterialResponseBody = {
  repo: string;
  material: string;
  counts: { commits: number; prs: number };
  createdAt: string;
};
