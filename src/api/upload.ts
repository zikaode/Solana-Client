export async function profileUser(token: string): Promise<Response> {
    return fetch('https://evoting-server.vercel.app/profile/' + '', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
}

export async function responseProfile(formDataProfile: any) {
    await fetch("https://evoting-server.vercel.app/upload/", {
        method: "POST",
        body: formDataProfile
    }
    )
};