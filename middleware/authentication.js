import Router from 'koa-router'

module.exports = async (ctx, next) => {
  const unauthorized = {
    errors: [{
      message: 'UNAUTHORIZED',
    }]
  }

  const badRequest = {
    errors: [{
      message: 'BADREQUEST',
    }]
  }

  try {
    let token = ctx.request.header['x-auth']

    // In dev, set the token
    if (!token && process.env.NODE_ENV === 'dev') {
      token = 'testtest'
    }

    if (!token) {
      ctx.currentUser = null
    } else {
      ctx.currentUser = await ctx.dataLoaders.user.load(token)
      if (!ctx.currentUser) {
        ctx.body = unauthorized
        return
      }
    }
  } catch (e) {
    ctx.body = badRequest
    return
  }

  await next()
}
