export type NotaraUser = {
  id: number;
  name: string;
  email: string;
  main_instrument?: string;
  photo_url?: string | null;
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
