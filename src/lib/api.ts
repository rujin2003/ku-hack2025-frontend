// API Service for backend communication
const BASE_URL = 'https://elvina-semijuridical-ungloweringly.ngrok-free.dev';

export interface RouterResponse {
  question: string;
  response: {
    explanation_needed: boolean;
    visualization_needed: boolean;
    manim_prompt: string | null;
  };
}

export interface LLMResponse {
  llm_response: string;
}

export interface SubjectResponse {
  status: string;
  subject: string;
}

// Set subject (mathematics or physics)
export const setSubject = async (subject: 'mathematics' | 'physics'): Promise<SubjectResponse> => {
  const response = await fetch(`${BASE_URL}/api/set-subject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ subject }),
  });

  if (!response.ok) {
    throw new Error(`Failed to set subject: ${response.statusText}`);
  }

  return response.json();
};

// Get router response to determine what type of response is needed
export const getRouterResponse = async (question: string): Promise<RouterResponse> => {
  const response = await fetch(`${BASE_URL}/api/router_response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Router request failed: ${response.statusText}`);
  }

  return response.json();
};

// Get LLM response for explanations
export const getLLMResponse = async (question: string): Promise<LLMResponse> => {
  const response = await fetch(`${BASE_URL}/api/llm_response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.statusText}`);
  }

  return response.json();
};
