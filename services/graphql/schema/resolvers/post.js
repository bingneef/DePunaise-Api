import { Post } from'../../../../models/Post'
import mongoose from 'mongoose'
import constants from '../../../../config/constants'

export default {
  Query: {
    postById: async ({ ctx }, { postId }) => await ctx.dataLoaders.post.load(postId),
    posts: async (root, { cursor, limit }) => {
      const params = { }

      const feed = await Post.find(params).sort({pubDate: -1}).skip(cursor).limit(limit)
      const totalCount = await Post.count(params).where(params)

      return {
        totalCount,
        feed,
      }
    }
  },
  Post: {
    excerpt: (post, { size }) => post.content[0].substring(0, size),
    pubDateTimestamp: post => new Date(post.pubDate).getTime(),
    imageSized: (post, { size }) => post.images.filter(image => image.size == size)[0] || {},
  },
  Image: {
    url: post => `${constants.staticUrl}/assets/${post.path}`,
  },
}
