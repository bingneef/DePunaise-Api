import mongoose from 'mongoose'
import constants from '../../config/constants'
import promise from 'bluebird'

mongoose.Promise = promise
mongoose.connect(constants.mongoDatabaseUrl, { promiseLibrary: global.Promise });

export default mongoose
