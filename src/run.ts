import app, {config} from './server'
import * as debug from 'debug'

app.listen(config.PORT, () => {
  debug('server:run')(`Server started on http://localhost:${config.PORT}`)
})