const { User } = require('../../models')

module.exports = {
  // fetch the profile of currenly athenticated user
  async user (_, args, { user }) {
    // Make sure user is logged in
    if (!user) {
      throw new Error('You are not authenticated!')
    }

    // user is authenticated
    return await User.findById(user.id)
  }
}
