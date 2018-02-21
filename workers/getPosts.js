import axios from 'axios'
import fs from 'fs'
import crypto from 'crypto'
import sharp from 'sharp'
import { Post } from '../models'
import constants from '../config/constants'

const { tokens: { facebookKey } } = constants

const splitMessage = message => {
  const parts = message.split(new RegExp(/\n[\-\=\—]{0,}\n/))

  return {
    title: parts.shift(),
    content: parts.join('\n').split('\n'),
  }
}

export const perform = async () => {
  let posts = []
  let containsNewPost = false

  try {
    const response = await axios.get('https://graph.facebook.com/v2.12/me', {
      params: {
        fields: "id,name,posts.limit(50){message,full_picture,created_time}",
        access_token: facebookKey,
      }
    })

    const { data, paging } = response.data.posts
    let promises = []

    for (let item of data) {
      if (item.message == undefined) {
        continue
      }

      let post = await Post.findOne({externalId: item.id})

      let itemIsNew = false
      if (!post) {
        post = new Post({externalId: item.id})
        itemIsNew = true
        containsNewPost = true
      }

      const { content, title} = splitMessage(item.message)

      let payload = {
        title,
        content,
        pubDate: item.created_time,
      }

      if (item.fullPicture) {
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


    if (!module.parent) process.exit(0)
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

    console.log(url)

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

if (!module.parent) perform()
