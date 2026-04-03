import { API_BASE_URL, request } from './api'

const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

function buildMenuPayload(payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (key === 'image' && value instanceof File) {
      formData.append(key, value)
      return
    }

    formData.append(key, value)
  })

  return formData
}

export async function getMenuItems(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  const response = await request(`/menu${query ? `?${query}` : ''}`)
  return response.data
}

export async function createMenuItem(payload) {
  const response = await request('/menu', {
    method: 'POST',
    body: buildMenuPayload(payload),
  })

  return response.data
}

export async function updateMenuItem(id, payload) {
  const response = await request(`/menu/${id}`, {
    method: 'PUT',
    body: buildMenuPayload(payload),
  })

  return response.data
}

export function resolveMenuImageUrl(imagePath) {
  if (!imagePath) {
    return ''
  }

  return imagePath.startsWith('http') ? imagePath : `${MEDIA_BASE_URL}${imagePath}`
}
