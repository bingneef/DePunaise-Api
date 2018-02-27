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
