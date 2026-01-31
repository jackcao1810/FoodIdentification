export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/password',
    REFRESH: '/auth/refresh',
  },
  DISHES: {
    LIST: '/dishes',
    DETAIL: (id: number) => `/dishes/${id}`,
    CATEGORIES: '/dishes/categories',
    SEARCH: '/dishes/search',
  },
  RECOGNITION: {
    UPLOAD: '/recognition/upload',
    ANALYZE: '/recognition/analyze',
    HISTORY: '/recognition/history',
    DETAIL: (id: number) => `/recognition/${id}`,
  },
  CALORIES: {
    DISH: (dishId: number) => `/calories/dish/${dishId}`,
    CALCULATE: '/calories/calculate',
    TODAY: '/calories/today',
    HISTORY: '/calories/history',
  },
  RECORDS: {
    LIST: '/records',
    DETAIL: (id: number) => `/records/${id}`,
    BY_DATE: (date: string) => `/records/date/${date}`,
  },
  RECOMMENDATIONS: {
    DAILY: '/recommendations/daily',
    WEEKLY: '/recommendations/weekly',
    ANALYSIS: '/recommendations/analysis',
  },
  STATISTICS: {
    OVERVIEW: '/statistics/overview',
    TREND: '/statistics/trend',
    NUTRIENTS: '/statistics/nutrients',
    DAILY: '/statistics/daily',
    WEEKLY: '/statistics/weekly',
    MONTHLY: '/statistics/monthly',
  },
} as const;
