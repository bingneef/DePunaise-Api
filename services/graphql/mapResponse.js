export default (keys, field, values) => {
  const fieldKeys = values.map(value => value[field])
  let response = []

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const index = fieldKeys.indexOf(key)
    if (index > -1) {
      response.push(values[index])
    } else {
      response.push(null)
    }
  }

  return response
}
