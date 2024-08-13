const url = "https://evoting-server.vercel.app"

export async function loginUser(email: string, password: string): Promise<Response> {
    return fetch(`${url}/auth/` + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
}

export async function registerUser(name: string, email: string, password: string): Promise<Response> {
    return fetch(`${url}/auth/` + 'register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });
}

export async function verifyEmail(token: string): Promise<Response> {
    return fetch(`${url}/auth/` + `verify-email/${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

export async function forgotPassword(email: string): Promise<Response> {
    return fetch(`${url}/auth/` + `forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(password: string, token: string): Promise<Response> {
    return fetch(`${url}/auth/` + `reset-password?token=${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });
}