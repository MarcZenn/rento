import { ENV } from '../client/config/env';

export default {
  providers: [
    {
      domain: ENV.clerk.frontendApiUrl,
      applicationID: 'convex',
    },
  ],
};
