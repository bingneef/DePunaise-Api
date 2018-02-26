import gcm from 'node-gcm'
import constants from '../config/constants'

export const sendNotification = async ({ body, postId, topic, exitAfter = false }) => {
  const message = new gcm.Message({
    data: {
      postId,
    },
    notification: {
      title: 'Nieuw bericht van DePunaise!',
      body,
    }
  })

  // Set up the sender with you API key, prepare your recipients' registration tokens.
  const sender = new gcm.Sender(constants.tokens.googleCloudMessaging)

  sender.send(message, `/topics/${topic}`, (err, response) => {
    if (err) {
      console.error('Something happened:', err)
    } else {
      console.log('Notification successfully send')
    }

    if (exitAfter) {
      process.exit(0)
    }
  })
}

if (!module.parent) sendNotification({body: 'TestMessage', postId: 'testtest'})
