// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ato = (arr: any[], key: string) => {
  return arr.reduce((obj, cur) => {
    obj[cur[key]] = cur
    return obj
  }, {})
}

export const getTEXT = (url: string) => {
  return getWebContents(url, 'text')
}
export const getJSON = (url: string) => {
  return getWebContents(url, 'json')
}
const getWebContents = (url: string, type: 'text' | 'json') => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res[type]())
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        reject(false)
      })
  })
}
