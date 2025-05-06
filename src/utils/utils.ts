// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ato = (arr: any[], key: string) => {
  return arr.reduce((obj, cur) => {
    obj[cur[key]] = cur
    return obj
  }, {})
}

export const getJSON = (url: string) => {
  return new Promise((resolve) => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        resolve(res)
      })
  })
}
export const getTEXT = (url: string) => {
  return new Promise((resolve) => {
    fetch(url)
      .then((res) => res.text())
      .then((res) => {
        resolve(res)
      })
  })
}
