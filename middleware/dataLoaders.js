import Router from 'koa-router'
import DataLoader from 'dataloader'

import { batchGetUsersByToken } from '../models/User'
import { batchGetPostsById } from '../models/Post'

export default async (ctx, next) => {
  ctx.dataLoaders = {
    user: new DataLoader(tokens => batchGetUsersByToken(tokens)),
    post: new DataLoader(ids => batchGetPostsById(ids)),
  }

  await next()
}
