import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvutjlwnhwddwidpfeeh.supabase.co';
const supabaseKey = 'sb_publishable_WPnBy6rdjH1RqKlxFpEn4g_6_Vp8irf';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'test' + Date.now() + '@gmail.com';
  console.log('Signing up with', email);
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: "Test User"
      }
    }
  });

  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }

  const userId = authData.user.id;
  console.log('User created:', userId);

  // Wait a second for trigger to finish? (It's synchronous though)
  await new Promise(r => setTimeout(r, 1000));

  // Try inserting a team
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { error: teamErr } = await supabase
    .from('teams')
    .insert({
      name: 'Test Team',
      team_code: code,
      created_by: userId,
      max_members: 5
    });

  if (teamErr) {
    console.error('Team insert error:', JSON.stringify(teamErr, null, 2));
  } else {
    console.log('Team inserted successfully!');
  }
}

main();
