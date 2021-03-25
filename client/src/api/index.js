import { get, post, put, del } from './fetchWrapper';

export const User = {
    auth: async () => await post(`/auth`),
    getData: async (_id) => await get(`/data/${_id}`),
    login: async (formData) => await post(`/login`, formData)
}

export const Teacher = {
    createAccount: async (formData) => await post(`/teacher`, formData)
}

export const Student = {
    getHomework: async (_id) => await get(`/student/${_id}/homework`),
    updateAvatar: async (_id, formData) => await put(`/student/${_id}/avatar`, formData)
}

export const Homework = {
    updateProgress: async (_id, formData) => await put(`/homework/${_id}/progress`, formData)
}

export const Badge = {
    createBadge: async (formData) => await post('/badge', formData),
    editBadge: async (_id, formData) => await put(`/badge/${_id}`, formData)
}