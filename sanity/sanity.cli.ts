import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fc8ot1td',
    dataset: 'production',
  },
  deployment: {
    appId: 'jx3ty6pl155yiizbs6ry5t4q',
    autoUpdates: true,
  },
})
