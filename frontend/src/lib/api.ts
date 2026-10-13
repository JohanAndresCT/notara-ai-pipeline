export type NotaraUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  description: string;
  main_instrument?: string;
  date_joined: string;
  score_count: number;
  likes_received: number;
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
  reaction_count?: number;
  user_reacted?: boolean;
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

const messageTranslations: Record<string, string> = {
  "Could not check your account session.": "No se pudo comprobar la sesión.",
  "Could not start a secure registration request.": "No se pudo iniciar el registro seguro.",
  "Could not start a secure authentication request.": "No se pudo iniciar la autenticación segura.",
  "Registration failed.": "No se pudo crear la cuenta.",
  "The registration response was incomplete.": "La respuesta del registro está incompleta.",
  "Email or password is incorrect.": "El correo o la contraseña no son correctos.",
  "The login response was incomplete.": "La respuesta del inicio de sesión está incompleta.",
  "Could not log out. Please try again.": "No se pudo cerrar la sesión. Inténtalo de nuevo.",
  "Profile update failed.": "No se pudo actualizar el perfil.",
  "The profile response was incomplete.": "La respuesta del perfil está incompleta.",
  "Password change failed.": "No se pudo cambiar la contraseña.",
  "Could not load community scores.": "No se pudieron cargar las partituras de la comunidad.",
  "Could not load this score.": "No se pudo cargar esta partitura.",
  "Could not update the reaction.": "No se pudo actualizar la reacción.",
  "Could not add the comment.": "No se pudo añadir el comentario.",
  "The comment response was incomplete.": "La respuesta del comentario está incompleta.",
  "Could not update this score.": "No se pudo actualizar la partitura.",
  "The updated score response was incomplete.": "La respuesta de la partitura actualizada está incompleta.",
  "Could not delete this score.": "No se pudo eliminar la partitura.",
  "Could not delete the comment.": "No se pudo eliminar el comentario.",
  "Publication failed.": "No se pudo publicar la partitura.",
  "The publication response was incomplete.": "La respuesta de publicación está incompleta.",
  "Request body must be valid JSON.": "El cuerpo de la solicitud debe ser JSON válido.",
  "Request body must be a JSON object.": "El cuerpo de la solicitud debe ser un objeto JSON.",
  "Enter your name.": "Escribe tu nombre.",
  "Name must be 150 characters or fewer.": "El nombre no puede superar los 150 caracteres.",
  "Enter your email address.": "Escribe tu correo electrónico.",
  "Enter a valid email address.": "Escribe un correo electrónico válido.",
  "Email address must be 254 characters or fewer.": "El correo no puede superar los 254 caracteres.",
  "An account with this email already exists.": "Ya existe una cuenta con este correo.",
  "Enter a password.": "Escribe una contraseña.",
  "Password must be at least 8 characters long.": "La contraseña debe tener al menos 8 caracteres.",
  "Authentication is required.": "Debes iniciar sesión para continuar.",
  "Logged out.": "Sesión cerrada.",
  "Profile update must contain valid form data.": "Los datos del perfil no son válidos.",
  "Name is required.": "El nombre es obligatorio.",
  "Username is required.": "El nombre de usuario es obligatorio.",
  "Use up to 30 lowercase letters, numbers, dots, underscores, or hyphens.": "Usa hasta 30 caracteres: letras minúsculas, números, puntos, guiones o guiones bajos.",
  "This username is already taken.": "Ese nombre de usuario ya está en uso.",
  "Description must be 500 characters or fewer.": "La descripción no puede superar los 500 caracteres.",
  "Choose an instrument from the list.": "Selecciona un instrumento de la lista.",
  "Current password is incorrect.": "La contraseña actual no es correcta.",
  "Enter your current password.": "Escribe tu contraseña actual.",
  "Enter a new password.": "Escribe una contraseña nueva.",
  "Password changed.": "Contraseña actualizada.",
  "Page must be a positive integer.": "El número de página debe ser un entero positivo.",
  "Score not found.": "No se encontró la partitura.",
  "You do not have permission to edit this score.": "No tienes permiso para editar esta partitura.",
  "You cannot react to your own score.": "No puedes reaccionar a tu propia partitura.",
  "Comment not found.": "No se encontró el comentario.",
  "You do not have permission to delete this comment.": "No tienes permiso para eliminar este comentario.",
  "You cannot comment on your own score.": "No puedes comentar en tu propia partitura.",
  "Only the author can delete this comment.": "Solo quien escribió el comentario puede eliminarlo.",
  "Comment deleted.": "Comentario eliminado.",
  "Choose ABC notation or plain text.": "Elige notación ABC o texto sin formato.",
  "ABC score must include X:, T:, M:, L:, and K: fields.": "La partitura ABC debe incluir los campos X:, T:, M:, L: y K:.",
  "ABC score must contain at least one note or rest on a musical line.": "La partitura ABC debe incluir al menos una nota o un silencio.",
  "Score content is required.": "El contenido de la partitura es obligatorio.",
  "Score content must be 1,000 characters or fewer.": "El contenido no puede superar los 1.000 caracteres.",
  "Title is required.": "El título es obligatorio.",
  "Instrument is required.": "El instrumento es obligatorio.",
  "Description is required.": "La descripción es obligatoria.",
  "Comment body is required.": "El comentario es obligatorio.",
  "Comment is required.": "El comentario es obligatorio.",
  "Comment must be 500 characters or fewer.": "El comentario no puede superar los 500 caracteres.",
};

function translateApiMessage(message: string, fallback: string): string {
  if (messageTranslations[message]) return messageTranslations[message];
  const required = message.match(/^(.+) is required\.$/);
  if (required) return `${required[1]} es obligatorio.`;
  return message || fallback;
}

function translateFieldErrors(errors: Record<string, string[]> = {}) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      messages.map((message) => translateApiMessage(message, "Revisa este campo.")),
    ]),
  );
}

function apiError(body: ApiError, fallback: string) {
  const fieldErrors = translateFieldErrors(body.errors);
  const firstFieldError = Object.values(fieldErrors).flat()[0];
  return Object.assign(
    new Error(translateApiMessage(body.message ?? firstFieldError ?? "", fallback)),
    { fieldErrors },
  );
}

// Keep the API contract in one small module so the UI can be replaced independently.
export async function getCurrentUser(): Promise<NotaraUser | null> {
  const response = await fetch("/api/v1/me/", { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("No se pudo comprobar la sesión.");
  const body = (await response.json()) as { user: NotaraUser };
  return body.user;
}

export async function registerAccount(
  values: { name: string; email: string; password: string },
): Promise<NotaraUser> {
  const csrfResponse = await fetch("/api/v1/csrf/", { credentials: "include" });
  if (!csrfResponse.ok) throw new Error("No se pudo iniciar el registro seguro.");
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
    throw apiError(body, "No se pudo crear la cuenta.");
  }
  if (!body.user) throw new Error("La respuesta del registro está incompleta.");
  return body.user;
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch("/api/v1/csrf/", { credentials: "include" });
  if (!response.ok) throw new Error("No se pudo iniciar la autenticación segura.");
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
    throw apiError(body, "El correo o la contraseña no son correctos.");
  }
  if (!body.user) throw new Error("La respuesta del inicio de sesión está incompleta.");
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
    throw apiError(body, "No se pudo cerrar la sesión. Inténtalo de nuevo.");
  }
}

export async function updateProfile(values: {
  username: string;
  name: string;
  description: string;
  mainInstrument: string;
}): Promise<NotaraUser> {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/v1/me/", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({
      username: values.username,
      name: values.name,
      description: values.description,
      main_instrument: values.mainInstrument,
    }),
  });
  const body = (await response.json()) as { user?: NotaraUser } & ApiError;
  if (!response.ok) {
    throw apiError(body, "No se pudo actualizar el perfil.");
  }
  if (!body.user) throw new Error("La respuesta del perfil está incompleta.");
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
    throw apiError(body, "No se pudo cambiar la contraseña.");
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

export const instrumentOptions = ["Piano", "Guitarra", "Violín", "Flauta", "Voz", "Otro"];

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export async function getCommunityScores(
  page = 1,
  instrument = "",
  mine = false,
): Promise<ScoreFeed> {
  const params = new URLSearchParams({ page: String(page) });
  if (instrument.trim()) params.set("instrument", instrument.trim());
  if (mine) params.set("mine", "1");
  const response = await fetch(`/api/v1/scores/?${params.toString()}`, { credentials: "include" });
  if (!response.ok) throw new Error("No se pudieron cargar las partituras de la comunidad.");
  return (await response.json()) as ScoreFeed;
}

async function parseApiError(response: Response, fallback: string): Promise<never> {
  const body = (await response.json().catch(() => ({}))) as ApiError;
  throw Object.assign(apiError(body, fallback), { status: response.status });
}

export async function getScore(scoreId: number): Promise<PublishedScore> {
  const response = await fetch(`/api/v1/scores/${scoreId}/`, { credentials: "include" });
  if (!response.ok) return parseApiError(response, "No se pudo cargar esta partitura.");
  const body = (await response.json()) as { score?: PublishedScore };
  if (!body.score) throw new Error("La respuesta de la partitura está incompleta.");
  return body.score;
}

export async function toggleScoreLike(
  scoreId: number,
  liked: boolean,
): Promise<{ liked: boolean; likeCount: number }> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/scores/${scoreId}/like/`, {
    method: liked ? "DELETE" : "PUT",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  const body = (await response.json()) as { liked?: boolean; like_count?: number } & ApiError;
  if (!response.ok) throw apiError(body, "No se pudo actualizar la reacción.");
  return { liked: Boolean(body.liked), likeCount: body.like_count ?? 0 };
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
  if (!response.ok) return parseApiError(response, "No se pudo actualizar la reacción.");
  return (await response.json()) as { reacted: boolean; reaction_count: number };
}

export async function getComments(scoreId: number): Promise<ScoreComment[]> {
  const response = await fetch(`/api/v1/scores/${scoreId}/comments/`, { credentials: "include" });
  if (!response.ok) return parseApiError(response, "No se pudieron cargar los comentarios.");
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
  if (!response.ok) return parseApiError(response, "No se pudo añadir el comentario.");
  const result = (await response.json()) as { comment?: ScoreComment };
  if (!result.comment) throw new Error("La respuesta del comentario está incompleta.");
  return result.comment;
}

export async function addScoreComment(scoreId: number, body: string): Promise<ScoreComment> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/scores/${scoreId}/comments/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({ body }),
  });
  if (!response.ok) return parseApiError(response, "No se pudo añadir el comentario.");
  const result = (await response.json()) as { comment?: ScoreComment };
  if (!result.comment) throw new Error("La respuesta del comentario está incompleta.");
  return result.comment;
}

export async function updateScore(
  scoreId: number,
  values: Partial<Pick<PublishedScore, "title" | "instrument" | "description" | "format" | "content">>,
): Promise<PublishedScore> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/scores/${scoreId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify(values),
  });
  if (!response.ok) return parseApiError(response, "No se pudo actualizar la partitura.");
  const body = (await response.json()) as { score?: PublishedScore };
  if (!body.score) throw new Error("La respuesta de la partitura actualizada está incompleta.");
  return body.score;
}

export async function deleteScore(scoreId: number): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/scores/${scoreId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  if (!response.ok) return parseApiError(response, "No se pudo eliminar la partitura.");
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
    throw apiError(body, "No se pudo eliminar el comentario.");
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
    throw apiError(body, "No se pudo publicar la partitura.");
  }
  if (!body.score) throw new Error("La respuesta de publicación está incompleta.");
  return body.score;
}
