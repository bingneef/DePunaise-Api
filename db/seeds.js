import { User } from '../models/User'
import { Post } from '../models/Post'

const clearDatabase = async () => {
  await User.remove()
  await Post.remove()
}

const init = async () => {
  try {
    await clearDatabase()
    await new User({ username: 'admin', token: 'testtest' }).save()
    await new User({ username: 'iosApp', token: 'iosApptesttest' }).save()
  } catch (e) {
    console.error(e)
  }

  process.exit()
}

init()
