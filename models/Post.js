import DataLoader from 'dataloader'
import mongoose from '../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from '../services/graphql/mapResponse'

const LikeSchema = new Schema({
  externalId: {
    type: String,
    index: true,
  },
  username: String,
})

const ImageSchema = new Schema({
  path: String,
  height: Number,
  width: Number,
  size: String,
  colorScheme: [String],
})

export const PostSchema = new Schema({
  externalId: {
    type: String,
    index: true,
  },
  title: String,
  content: [String],
  pubDate: Date,
  views: Number,
  images: [ImageSchema],
})

class PostClass { }

PostSchema.loadClass(PostClass);

export const Post = mongoose.model('Post', PostSchema)

export const batchGetPostsById = ids => {
  return new Promise(async (resolve, reject) => {
    const posts = await Post.find({ _id: { $in: ids.map(id => mongoose.Types.ObjectId(id)) } })

    // Only because we know ids is unique
    if (posts.length == ids.length) {
      resolve(posts)
    }
    const response = mapResponse(ids, 'id', posts)
    resolve(response)
  })
}
