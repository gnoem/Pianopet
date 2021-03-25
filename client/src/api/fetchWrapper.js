import { handleError, handleResponse, FetchError } from './handleError';

const makeRequest = (method) => (url, body, options = defaultOptions) => {
    return Promise.race([
        fetchRequest(method, url, body, options),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 10000);
        })
    ]).catch(err => {
        if (err.message === 'Timeout') throw new FetchError({ message: 'The connection timed out.' });
        throw err;
    });
}

const fetchRequest = (method, url, body, options) => {
    return fetch(url, { method, body: JSON.stringify(body), ...options })
        .then(handleError)
        .then(handleResponse);
}

export const get = makeRequest('GET');
export const post = makeRequest('POST');
export const put = makeRequest('PUT');
export const del = makeRequest('DELETE');

const defaultOptions = {
    headers: { 'Content-Type': 'application/json' }
}