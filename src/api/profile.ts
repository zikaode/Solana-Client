export async function profileUser(token: string): Promise<Response> {
    return fetch('https://evoting-server.vercel.app/profile/' + '', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
}

export async function updateProfileUser(token: string, nim: string, prodi: any, jurusan: any, address?: string, image?: string, imageKTM?: string): Promise<Response> {
    return fetch('https://evoting-server.vercel.app/profile/' + 'update', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }, body: JSON.stringify({ nim, prodi, jurusan, address, image, imageKTM }),
    });
}

export async function updateAddressUser(token: string, address: string, addressUpdate: boolean): Promise<Response> {
    return fetch('https://evoting-server.vercel.app/profile/' + 'update', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }, body: JSON.stringify({ address, addressUpdate }),
    });
}

export async function changePassword(token: string, oldPassword: string, newPassword: string, confirmNewPassword: string) {
    const response = await fetch('https://evoting-server.vercel.app/profile/' + 'reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            token,
            oldPassword,
            newPassword,
            confirmNewPassword
        })
    });

    return response;
}

export async function userInit(token: string, userId: string, publicKey: string): Promise<Response> {
    return fetch('https://evoting-server.vercel.app/profile/' + 'user-init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            token,
            publicKey,
            userId
        })
    });
}