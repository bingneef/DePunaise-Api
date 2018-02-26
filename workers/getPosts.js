import axios from 'axios'
import fs from 'fs'
import crypto from 'crypto'
import sharp from 'sharp'
import { Post } from '../models'
import constants from '../config/constants'
import { sendNotification } from '.'

const { tokens: { facebookKey } } = constants

const splitMessage = message => {
  const parts = message.split(new RegExp(/\n[\-\=\—]{0,}\n/))

  return {
    title: parts.shift(),
    content: parts.join('\n').split('\n').filter(item => !!item),
  }
}

export const getPosts = async () => {
  let posts = []
  let newPost = null

  try {
    const response = await axios.get('https://graph.facebook.com/v2.12/me', {
      params: {
        fields: "id,name,posts.limit(5){message,full_picture,created_time}",
        access_token: facebookKey,
      }
    })

    const { data, paging } = response.data.posts
    let promises = []

    for (let item of data) {
      // Guards
      if (item.message == undefined) {
        continue
      }

      const { content, title} = splitMessage(item.message)
      // If we don't have content, or we don't have an image, continue
      if (content.length == 0 || content[0] == '' || !item.full_picture) {
        continue
      }

      let post = await Post.findOne({externalId: item.id})

      if (!post) {
        post = new Post({externalId: item.id})

        if (!newPost) {
          newPost = {
            postId: post.id,
            body: title,
          }
        }
      }


      let payload = {
        title,
        content,
        pubDate: item.created_time,
      }

      if (item.full_picture) {
        const images = await handleNewImages(item.full_picture, item.id)

        payload = {
          ...payload,
          images,
        }
      }

      post.set(payload)
      promises.push(post.save())
    }

    await Promise.all(promises)

    if (newPost) {
      const { body, postId } = newPost
      await sendNotification({body, postId, exitAfter: true, topic: 'news'})
    } else if (!module.parent) {
      process.exit(0)
    }
  } catch (e) {
    // Send to Sentry
    console.log(e)
    if (!module.parent) process.exit(1)
  }
}

const handleNewImages = async (url, id) => {
  try {
    const imageId = crypto.randomBytes(10).toString('hex')
    const baseDir = `./public/assets`
    const imageDir = `post/${id}`
    let colors = []
    try {
      colors = await getColors(url)
      colors = colors.map(color => color.hex())
    } catch (e) { }

    const response = await axios.get(url, { responseType: 'arraybuffer' })
    if (!fs.existsSync(`${baseDir}/${imageDir}`)) {
      fs.mkdirSync(`${baseDir}/${imageDir}`);
    }

    let dimensions = [
      {
        width: 800,
        height: 600,
        size: 'detail'
      },
      {
        width: 600,
        height: 300,
        size: 'banner-sm'
      },
      {
        width: 120,
        height: 120,
        size: 'square-sm'
      }
    ]
    let images = []

    for (let dimension of dimensions) {
      const image = await resizeImage(response.data, baseDir, imageDir, dimension)
      images.push(image)
    }

    return images
  } catch (e) {
    console.log(e)
    return []
  }
}

const resizeImage = async (data, baseDir, imageDir, {size, width, height}) => {
  const filePath = `${imageDir}/${size}.jpg`

  await sharp(data)
    .resize(width, height)
    .toFile(`${baseDir}/${filePath}`)

  return {
    path: filePath,
    size,
    width,
    height,
  }
}

if (!module.parent) getPosts()
