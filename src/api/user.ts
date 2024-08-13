export const fetchUsers = async (token: string, search = '', page = 1, limit = 10) => {
    const response = await fetch('https://evoting-server.vercel.app/user/' + `?search=${search}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response;
};