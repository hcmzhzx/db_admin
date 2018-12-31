import request from '@/plugin/axios'

export function AccountLogin(data) {
   return request({
      url: '/auth',
      method: 'post',
      data
   })
}

export function httpGet(url, params = {}) {
   return request({
      url,
      method: 'get',
      params
   })
}

export function httpPost(url, data = {}) {
   return request({
      url,
      method: 'post',
      data
   })
}

export function httpAdd(url ,data = {}) {
   data = Object.assign({method: "add"}, data)
   return request({
      url,
      method: 'post',
      data
   })
}

export function httpEdit(url, data = {}) {
   data = Object.assign({method: "edit"}, data)
   return request({
      url,
      method: 'post',
      data
   })
}

export function httpTrash(url, data = {}) {
   data = Object.assign({method: "trash"}, data)
   return request({
      url,
      method: 'post',
      data
   })
}

export function httpAddUm(url ,data = {}) {
   return request({
      url,
      method: 'post',
      data
   })
}

export function httpEditUm(url, data = {}) {
   return request({
      url,
      method: 'post',
      data
   })
}
