import { request } from './api'

export async function getOrdersByRestaurant(restaurantId) {
  const response = await request(`/orders?restaurant=${restaurantId}`)
  return response.data
}

export async function updateOrderStatus(orderId, status) {
  const response = await request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  return response.data
}
