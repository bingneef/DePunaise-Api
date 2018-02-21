import cron from 'node-cron'
import { getPosts } from './workers'

export const initCron = () => {
  console.log('Starting CronJobs')

  // Every 15 minutes
  cron.schedule('*/15 * * * *', async () =>{
    console.log('Cronjob starting: getPosts')
    await getPosts()
    console.log('Cronjob ended: getPosts')
  })
}
