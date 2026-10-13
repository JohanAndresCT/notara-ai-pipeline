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
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_owner?: boolean;
  comments?: ScoreComment[];
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
  const response = await fetch("/api/me/", { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not check your account session.");
  const body = (await response.json()) as { user: NotaraUser };
  return body.user;
}

export async function registerAccount(
  values: { name: string; email: string; password: string },
): Promise<NotaraUser> {
  const csrfResponse = await fetch("/api/csrf/", { credentials: "include" });
  if (!csrfResponse.ok) throw new Error("Could not start a secure registration request.");
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  const response = await fetch("/api/auth/register/", {
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
  const response = await fetch("/api/csrf/", { credentials: "include" });
  if (!response.ok) throw new Error("Could not start a secure authentication request.");
  const body = (await response.json()) as { csrfToken: string };
  return body.csrfToken;
}

export async function loginAccount(email: string, password: string): Promise<NotaraUser> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/auth/login/", {
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
  const response = await fetch("/api/auth/logout/", {
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

  const response = await fetch("/api/me/", {
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
  const response = await fetch("/api/me/password/", {
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

export async function getCommunityScores(options: { page?: number; instrument?: string } = {}): Promise<{
  scores: PublishedScore[];
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.instrument) params.set("instrument", options.instrument);
  const query = params.toString();
  const response = await fetch(`/api/scores/${query ? `?${query}` : ""}`, { credentials: "include" });
  if (!response.ok) throw new Error("Could not load community scores.");
  const body = (await response.json()) as { scores: PublishedScore[]; page: number; total_pages: number };
  return { scores: body.scores, page: body.page, totalPages: body.total_pages };
}

export async function getScore(scoreId: number): Promise<PublishedScore> {
  const response = await fetch(`/api/scores/${scoreId}/`, { credentials: "include" });
  const body = (await response.json()) as { score?: PublishedScore } & ApiError;
  if (!response.ok || !body.score) throw new Error(body.message ?? "Could not load the score.");
  return body.score;
}

export async function toggleScoreLike(scoreId: number, liked: boolean): Promise<{ liked: boolean; likeCount: number }> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/scores/${scoreId}/like/`, {
    method: liked ? "DELETE" : "PUT",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  const body = (await response.json()) as { liked?: boolean; like_count?: number } & ApiError;
  if (!response.ok) throw new Error(body.message ?? "Could not update the reaction.");
  return { liked: Boolean(body.liked), likeCount: body.like_count ?? 0 };
}

export async function addScoreComment(scoreId: number, body: string): Promise<ScoreComment> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/scores/${scoreId}/comments/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({ body }),
  });
  const result = (await response.json()) as { comment?: ScoreComment } & ApiError;
  if (!response.ok || !result.comment) {
    const fieldErrors = Object.values(result.errors ?? {}).flat();
    throw new Error(result.message ?? fieldErrors[0] ?? "Could not add the comment.");
  }
  return result.comment;
}

export async function deleteScore(scoreId: number): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/scores/${scoreId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.message ?? "Could not delete the score.");
  }
}

export async function updateScore(
  scoreId: number,
  values: Pick<PublishedScore, "title" | "instrument" | "description" | "format" | "content">,
): Promise<PublishedScore> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/scores/${scoreId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify(values),
  });
  const body = (await response.json()) as { score?: PublishedScore } & ApiError;
  if (!response.ok || !body.score) throw new Error(body.message ?? "Could not update the score.");
  return body.score;
}

export async function deleteComment(commentId: number): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/comments/${commentId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.message ?? "Could not delete the comment.");
  }
}

export async function publishScore(values: {
  title: string;
  instrument: string;
  description: string;
  format: PublishedScore["format"];
  content: string;
}): Promise<PublishedScore> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/scores/", {
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
