const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "http://localhost:5000/api";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('userToken');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Schedule API functions
export const scheduleAPI = {
  // Create a new schedule
  create: async (scheduleData: {
    goalName: string;
    objective: string;
    deadline: string;
    dedication: string;
    isManual: boolean;
    scheduleData: string;
    totalTasks: number;
  }) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },

  // Get all schedules for the current user
  getAll: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/schedules`);
  },

  // Get a specific schedule by ID
  getById: async (scheduleId: string) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/schedules/${scheduleId}`);
  },

  // Update schedule progress
  updateProgress: async (scheduleId: string, progress: boolean[][]) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/schedules/${scheduleId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  },

  // Delete a schedule
  delete: async (scheduleId: string) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  },
};

export default scheduleAPI;

