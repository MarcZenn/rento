import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { httpRouter } from 'convex/server';

const http = httpRouter();

//////////////
// ACTIONS

export const createUser = httpAction(async (ctx, req) => {
  const { data, type } = await req.json();

  switch (type) {
    case 'user.created':
      const userId = await ctx.runMutation(internal.users.createUser, {
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        username: data.username,
      });

      // TODO:: wrap all of this try catch statements.
      if (userId) {
        await ctx.runMutation(internal.profiles.createUserProfile, {
          user_id: userId,
        });
      }

      break;
    case 'user.updated':
      console.log('user updated');
      break;

    default:
      break;
  }

  // implementation will be here
  return new Response();
});

//////////////
// ROUTES

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: createUser,
});

export default http;
