/**
 * MAXFORM Unifed Cross-Platform API Client
 * Shared across Mobile (React Native + Expo), Web (Next.js), and PWA clients.
 */

export interface ApiClientConfig {
  baseUrl?: string;
  getAuthToken?: () => Promise<string | null>;
}

export class MaxFormApiClient {
  private baseUrl: string;
  private getAuthToken?: () => Promise<string | null>;

  constructor(config?: ApiClientConfig) {
    this.baseUrl = config?.baseUrl || (typeof window !== 'undefined' ? '' : 'https://api.maxmindperformance.com');
    this.getAuthToken = config?.getAuthToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        // ignore fallback
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth & User ---
  async getMe(userId: string) {
    return this.request<{
      userId: string;
      xp: number;
      levelNumber: number;
      levelName: string;
      timezone: string;
      serverTime: string;
      canonicalDate: string;
      membership: string;
    }>(`/api/me?userId=${encodeURIComponent(userId)}`);
  }

  // --- Dashboard & Daily Form ---
  async getDashboard(userId: string) {
    return this.request<{
      date: string;
      serverTimestamp: string;
      totalXp: number;
      levelInfo: { levelNumber: number; levelName: string };
      completedObjectives: string[];
      formPercentage: number;
      nutrition: { protein: number; targetProtein: number };
    }>(`/api/dashboard?userId=${encodeURIComponent(userId)}`);
  }

  // --- Objectives & XP (Authoritative + Idempotent) ---
  async completeObjective(userId: string, objectiveId: string, date?: string) {
    return this.request<{
      success: boolean;
      alreadyCompleted: boolean;
      xpAwarded: number;
      totalXp: number;
      levelNumber: number;
      levelName: string;
    }>('/api/objectives/complete', {
      method: 'POST',
      body: JSON.stringify({ userId, objectiveId, date }),
    });
  }

  async logProtein(userId: string, amount: number, date?: string, targetProtein = 150) {
    return this.request<{
      success: boolean;
      amountAdded: number;
      dailyTotal: number;
      targetMet: boolean;
      xpAwarded: number;
      totalXp: number;
      levelNumber: number;
      levelName: string;
    }>('/api/xp/log-protein', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, date, targetProtein }),
    });
  }

  // --- Food Diary ---
  async logMeal(userId: string, meal: { name: string; protein: number; carbs: number; fats: number; calories: number }) {
    return this.request<{ success: boolean; entry: any }>('/api/food/log', {
      method: 'POST',
      body: JSON.stringify({ userId, ...meal }),
    });
  }

  // --- Supplements ---
  async logSupplement(userId: string, name: string, dosage?: string) {
    return this.request<{ success: boolean; entry: any }>('/api/supplements', {
      method: 'POST',
      body: JSON.stringify({ userId, name, dosage }),
    });
  }

  // --- Coupon Redemption (Server-Authoritative) ---
  async redeemCoupon(code: string, userEmail?: string) {
    return this.request<{
      success: boolean;
      message: string;
      plan?: string;
      durationDays?: number;
    }>('/api/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({ code, userEmail }),
    });
  }

  // --- AI Refrigerator & Coach ---
  async queryRefrigerator(ingredients: string[], missingProtein = 25, goal?: string) {
    return this.request<any>('/api/ai/refrigerator', {
      method: 'POST',
      body: JSON.stringify({ ingredients, missingProtein, goal }),
    });
  }

  async askCoach(message: string, context?: any) {
    return this.request<{ reply: string; timestamp: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  // --- Challenges & Leaderboards ---
  async getChallenges(userId: string) {
    return this.request<{ challenges: any[] }>(`/api/challenges?userId=${encodeURIComponent(userId)}`);
  }

  async joinChallenge(userId: string, challengeId: string) {
    return this.request<{ success: boolean; joinedChallengeId: string }>(`/api/challenges/${encodeURIComponent(challengeId)}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getLeaderboard(userId: string) {
    return this.request<{
      league: string;
      userRank: number | null;
      userXp: number;
      hasPosition: boolean;
      emptyMessage: string | null;
    }>(`/api/leaderboard?userId=${encodeURIComponent(userId)}`);
  }
}

export const maxFormApi = new MaxFormApiClient();
