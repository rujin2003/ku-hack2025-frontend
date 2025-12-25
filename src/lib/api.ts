// API Service for backend communication
const BASE_URL = 'https://elvina-semijuridical-ungloweringly.ngrok-free.dev';
const MANIM_URL = 'https://wearisome-halle-marbly.ngrok-free.dev';

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

// Generate Manim animation video - uses arrayBuffer for reliable binary handling
export const generateManimVideo = async (manimPrompt: string): Promise<string> => {
  const response = await fetch(`${MANIM_URL}/generate-video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ manim_prompt: manimPrompt }),
  });

  if (!response.ok) {
    throw new Error(`Manim video generation failed: ${response.statusText}`);
  }

  // Use arrayBuffer for reliable binary handling with ngrok
  const buffer = await response.arrayBuffer();
  
  // Validate buffer size to prevent zero-length video issues
  if (buffer.byteLength < 5000) {
    throw new Error('Video too small — invalid file returned');
  }

  // Convert ArrayBuffer to Blob then to ObjectURL
  const blob = new Blob([buffer], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
};
