export const fetchElection = async (token: string, search = '', page = 1, limit = 10) => {
    const response = await fetch('https://evoting-server.vercel.app/election/' + `?search=${search}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

const fetch = async (url: any, options: any) => {
    try {
        const response = await window.fetch(`${url}`, options);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteElection = async (token: any, id: any) => {
    try {
        const response = await fetch('https://evoting-server.vercel.app/election/delete/' + `${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchResult = async () => {
    const response = await fetch('https://evoting-server.vercel.app/result/finished', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export default fetch;