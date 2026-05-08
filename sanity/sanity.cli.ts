import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fc8ot1td',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
  },
})
