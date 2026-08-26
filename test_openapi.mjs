

const supabaseUrl = 'https://jvutjlwnhwddwidpfeeh.supabase.co';
const supabaseKey = 'sb_publishable_WPnBy6rdjH1RqKlxFpEn4g_6_Vp8irf';

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const spec = await res.json();

  if (spec.definitions && spec.definitions.teams) {
    console.log("TEAMS TABLE SCHEMA:", JSON.stringify(spec.definitions.teams.properties, null, 2));
  } else {
    console.log("Teams table not found in OpenAPI spec");
  }
}

main();
