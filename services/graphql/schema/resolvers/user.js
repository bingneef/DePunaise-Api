import { User } from '../../../../models/User'

export default {
  Query: {
    currentUser: async ({ ctx }) => {
      return ctx.currentUser
    },
  },
  Mutation: {
    validateToken: async ({ ctx }, { token }) => await ctx.dataLoaders.user.load(token),
    createOrUpdateUser: async ({ ctx }, { user: { email, familyName, givenName, externalId, name, photoUrl } }) => {
      let user = await User.findOne({externalId})
      if (!user) {
        user = new User()
      }
      user.set({email, familyName, givenName, externalId, name, photoUrl, token: null})
      return await user.save()
    },
    setNotifications: async ({ ctx }, { notifications }) => {
      let user = ctx.currentUser
      if (!user) {
        throw new Error('BADREQUEST')
      }
      if (user.notifications) {
        user.notifications.set(notifications)
      } else {
        user.set({ notifications })
      }

      user = await user.save()

      return user.notifications
    },
  },
}
