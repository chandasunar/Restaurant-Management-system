import { request } from './api'

export async function registerRestaurant(payload) {
  const response = await request('/restaurants', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function verifyOtp(payload) {
  const response = await request('/restaurants/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function resendOtp(payload) {
  return request('/restaurants/resend-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function loginRestaurant(payload) {
  const response = await request('/restaurants/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function getRestaurantById(id) {
  const response = await request(`/restaurants/${id}`)
  return response.data
}

export async function updateRestaurant(id, payload) {
  const response = await request(`/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response.data
}
