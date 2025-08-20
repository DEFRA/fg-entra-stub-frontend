export const health = {
  method: 'GET',
  path: '/health',
  handler() {
    return {
      message: 'success'
    }
  }
}
