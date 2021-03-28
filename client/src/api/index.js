import { get, post, put, del } from './fetchWrapper';

export const User = {
    auth: async () => await post(`/auth`),
    getData: async (_id) => await get(`/data/${_id}`),
    login: async (formData) => await post(`/login`, formData), // todo specify role based on login form type!!!!
    logout: async () => await post('/logout'),
    editAccount: async (_id, formData) => await put(`/${formData?.role}/${_id}`, formData),
    changePassword: async (_id, formData) => await put(`/${formData?.role}/${_id}/password`, formData)
}

export const Teacher = {
    createAccount: async (formData) => await post(`/teacher`, formData)
}

export const Student = {
    createAccount: async (formData) => await post(`/student`, formData),
    getHomework: async (_id) => await get(`/student/${_id}/homework`),
    updateCoins: async (_id, formData) => await put(`/student/${_id}/coins`, formData),
    updateAvatar: async (_id, formData) => await put(`/student/${_id}/avatar`, formData),
    updateCloset: async (_id, formData) => await put(`/student/${_id}/closet`, formData),
    updateBadges: async (_id, formData) => await put(`/student/${_id}/badges`, formData),
    deleteAccount: async (_id) => await del(`/student/${_id}`)
}

export const Homework = {
    createHomework: async (formData) => await post('/homework', formData),
    editHomework: async (_id, formData) => await put(`/homework/${_id}`, formData),
    updateProgress: async (_id, formData) => await put(`/homework/${_id}/progress`, formData),
    updateRecorded: async (_id, formData) => await put(`/homework/${_id}/recorded`, formData),
    deleteHomework: async (_id) => await del(`/homework/${_id}`)
}

export const Wearable = {
    createWearable: async (formData) => await post('/wearable', formData),
    editWearable: async (_id, formData) => await put(`/wearable/${_id}`, formData),
    deleteWearable: async (_id) => await del(`/wearable/${_id}`)
}

export const Category = {
    createCategory: async (formData) => await post('/category', formData),
    editCategory: async (_id, formData) => await put(`/category/${_id}`, formData),
    deleteCategory: async (_id) => await del(`/category/${_id}`)
}

export const Badge = {
    createBadge: async (formData) => await post('/badge', formData),
    editBadge: async (_id, formData) => await put(`/badge/${_id}`, formData),
    updateRedeemed: async (_id, formData) => await put(`/badge/${_id}/redeemed`, formData),
    deleteBadge: async (_id) => await del(`/badge/${_id}`)
}