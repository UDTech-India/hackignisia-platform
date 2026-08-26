
const supabaseUrl = 'https://jvutjlwnhwddwidpfeeh.supabase.co';
const supabaseKey = 'sb_publishable_WPnBy6rdjH1RqKlxFpEn4g_6_Vp8irf';

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/events?select=*`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log("EVENTS:", data);
}

main();
