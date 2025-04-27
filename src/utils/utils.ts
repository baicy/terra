// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ato = (arr: any[], key: string) => {
  return arr.reduce((obj, cur) => {
    obj[cur[key]] = cur
    return obj
  }, {})
}
