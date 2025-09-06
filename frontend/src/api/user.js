import axios from 'axios'

export function getHello() {
  return axios.get('/api/hello/')
}
