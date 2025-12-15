export type GenerateRequestBody = {
  projectName: string;
  techStack?: string;
  material: string;
  count?: number;
  language?: 'zh' | 'en';
  style?: 'aggressive' | 'balanced' | 'conservative';
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
    language: 'zh' | 'en';
    style: 'aggressive' | 'balanced' | 'conservative';
    createdAt: string;
    model: string;
    mockMode: boolean;
  };
};

