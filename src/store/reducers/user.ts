const initialState = { me: {} }

export default (state = initialState, action) => {
  switch (action.type) {
    case 'user/login':
      return action.payload
    case 'user/logout':
      return null
    default:
      return state
  }
}
