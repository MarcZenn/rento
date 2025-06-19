import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { httpRouter } from 'convex/server';

const http = httpRouter();

// const endpoint = 'https://academic-lion-474.convex.site/';

export const doSomething = httpAction(async (ctx, req) => {
  const { data, type } = await req.json();

  switch (type) {
    case 'user.created':
      await ctx.runMutation(internal.users.createUser, {
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        username: data.username,
        phone_number: data.phone_number,
        first_name: data.first_name,
        surname: data.surname,
        employment_status: data.employment_status,
        user_type: data.user_type,
        is_foreign_resident: data.is_foreign_resident,
        nationality: data.nationality,
        has_guarantor: data.has_guarantor,
        consecutive_years_employed: data.consecutive_years_employed,
        rental_readiness_score: data.rental_readiness_score,
        saved_properties: data.saved_properties,
        onboarding_completed: data.onboarding_completed,
        last_active: data.last_active,
        updated_at: data.updated_at,
      });

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

http.route({
  path: '/clerk-users-webhook',
  method: 'GET',
  handler: doSomething,
});

export default http;
