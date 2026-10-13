export type NotaraUser = {
  id: number;
  name: string;
  email: string;
  main_instrument?: string;
  photo_url?: string | null;
};

export type PublishedScore = {
  id: number;
  title: string;
  instrument: string;
  description: string;
  format: "ABC" | "TEXT";
  content: string;
  author: string;
  author_id: number;
  created_at: string;
  reaction_count: number;
  user_reacted: boolean;
};

export type ScoreComment = {
  id: number;
  body: string;
  author: string;
  author_id: number;
  created_at: string;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

// Keep the API contract in one small module so the UI can be replaced independently.
export async function getCurrentUser(): Promise<NotaraUser | null> {
  const response = await fetch("/api/v1/me/", { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not check your account session.");
  const body = (await response.json()) as { user: NotaraUser };
  return body.user;
}

export async function registerAccount(
  values: { name: string; email: string; password: string },
): Promise<NotaraUser> {
  const csrfResponse = await fetch("/api/v1/csrf/", { credentials: "include" });
  if (!csrfResponse.ok) throw new Error("Could not start a secure registration request.");
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  const response = await fetch("/api/v1/auth/register/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(values),
  });

  const body = (await response.json()) as { user?: NotaraUser } & ApiError;
  if (!response.ok) {
    const fieldErrors = Object.values(body.errors ?? {}).flat();
    throw Object.assign(new Error(body.message ?? fieldErrors[0] ?? "Registration failed."), {
      fieldErrors: body.errors ?? {},
    });
  }
  if (!body.user) throw new Error("The registration response was incomplete.");
  return body.user;
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch("/api/v1/csrf/", { credentials: "include" });
  if (!response.ok) throw new Error("Could not start a secure authentication request.");
  const body = (await response.json()) as { csrfToken: string };
  return body.csrfToken;
}

export async function loginAccount(email: string, password: string): Promise<NotaraUser> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/v1/auth/login/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ email, password }),
  });
  const body = (await response.json()) as { user?: NotaraUser } & ApiError;
  if (!response.ok) {
    throw new Error(body.message ?? "Email or password is incorrect.");
  }
  if (!body.user) throw new Error("The login response was incomplete.");
  return body.user;
}

export async function logoutAccount(): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/v1/auth/logout/", {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.message ?? "Could not log out. Please try again.");
  }
}

export async function updateProfile(values: {
  name: string;
  mainInstrument: string;
  photo?: File;
}): Promise<NotaraUser> {
  const csrfToken = await getCsrfToken();
  const formData = new FormData();
  formData.set("name", values.name);
  formData.set("main_instrument", values.mainInstrument);
  if (values.photo) formData.set("photo", values.photo);

  const response = await fetch("/api/v1/me/", {
    method: "PATCH",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
    body: formData,
  });
  const body = (await response.json()) as { user?: NotaraUser } & ApiError;
  if (!response.ok) {
    const fieldErrors = Object.values(body.errors ?? {}).flat();
    throw Object.assign(new Error(body.message ?? fieldErrors[0] ?? "Profile update failed."), {
      fieldErrors: body.errors ?? {},
    });
  }
  if (!body.user) throw new Error("The profile response was incomplete.");
  return body.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/v1/me/password/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  const body = (await response.json()) as ApiError;
  if (!response.ok) {
    const fieldErrors = Object.values(body.errors ?? {}).flat();
    throw Object.assign(new Error(body.message ?? fieldErrors[0] ?? "Password change failed."), {
      fieldErrors: body.errors ?? {},
    });
  }
}

export type ScoreFeed = {
  scores: PublishedScore[];
  page: number;
  page_size: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
};

export async function getCommunityScores(
  page = 1,
  instrument = "",
): Promise<ScoreFeed> {
  const params = new URLSearchParams({ page: String(page) });
  if (instrument.trim()) params.set("instrument", instrument.trim());
  const response = await fetch(`/api/v1/scores/?${params.toString()}`, { credentials: "include" });
  if (!response.ok) throw new Error("Could not load community scores.");
  return (await response.json()) as ScoreFeed;
}

async function parseApiError(response: Response, fallback: string): Promise<never> {
  const body = (await response.json().catch(() => ({}))) as ApiError;
  const fieldErrors = Object.values(body.errors ?? {}).flat();
  throw Object.assign(new Error(body.message ?? fieldErrors[0] ?? fallback), {
    fieldErrors: body.errors ?? {},
    status: response.status,
  });
}

export async function getScore(scoreId: number): Promise<PublishedScore> {
  const response = await fetch(`/api/v1/scores/${scoreId}/`, { credentials: "include" });
  if (!response.ok) return parseApiError(response, "Could not load this score.");
  const body = (await response.json()) as { score?: PublishedScore };
  if (!body.score) throw new Error("The score response was incomplete.");
  return body.score;
}

export async function updateScore(
  scoreId: number,
  values: Partial<Pick<PublishedScore, "title" | "instrument" | "description">>,
): Promise<PublishedScore> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/scores/${scoreId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify(values),
  });
  if (!response.ok) return parseApiError(response, "Could not update this score.");
  const body = (await response.json()) as { score?: PublishedScore };
  if (!body.score) throw new Error("The updated score response was incomplete.");
  return body.score;
}

export async function deleteScore(scoreId: number): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/scores/${scoreId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  if (!response.ok) return parseApiError(response, "Could not delete this score.");
}

export async function toggleReaction(
  scoreId: number,
): Promise<{ reacted: boolean; reaction_count: number }> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/scores/${scoreId}/reactions/`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  if (!response.ok) return parseApiError(response, "Could not update the reaction.");
  return (await response.json()) as { reacted: boolean; reaction_count: number };
}

export async function getComments(scoreId: number): Promise<ScoreComment[]> {
  const response = await fetch(`/api/v1/scores/${scoreId}/comments/`, { credentials: "include" });
  if (!response.ok) return parseApiError(response, "Could not load comments.");
  const body = (await response.json()) as { comments?: ScoreComment[] };
  return body.comments ?? [];
}

export async function addComment(scoreId: number, body: string): Promise<ScoreComment> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/scores/${scoreId}/comments/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({ body }),
  });
  if (!response.ok) return parseApiError(response, "Could not add the comment.");
  const result = (await response.json()) as { comment?: ScoreComment };
  if (!result.comment) throw new Error("The comment response was incomplete.");
  return result.comment;
}

export async function publishScore(values: {
  title: string;
  instrument: string;
  description: string;
  format: PublishedScore["format"];
  content: string;
}): Promise<PublishedScore> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/v1/scores/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(values),
  });
  const body = (await response.json()) as { score?: PublishedScore } & ApiError;
  if (!response.ok) {
    const fieldErrors = Object.values(body.errors ?? {}).flat();
    throw Object.assign(new Error(body.message ?? fieldErrors[0] ?? "Publication failed."), {
      fieldErrors: body.errors ?? {},
    });
  }
  if (!body.score) throw new Error("The publication response was incomplete.");
  return body.score;
}
