const fs = require('fs');
let content = fs.readFileSync('src/lib/api/api.ts', 'utf-8');
const serverFuncs = ['serverCreateAccount', 'serverDeleteSociety', 'serverDeleteUser', 'serverInsertFlat', 'serverDeleteFlat', 'serverGenerateBills', 'serverCreatePoll', 'serverSendBulkReminders', 'serverGetAllPayments', 'serverGetSocietiesWithStats', 'serverGetMonthlyGrowth', 'serverGetSystemLogs'];

serverFuncs.forEach(fn => {
  const regex = new RegExp(`await ${fn}\\(\\{[\\s\\S]*?data:\\s*\\{`, 'g');
  content = content.replace(regex, match => {
    return match + '\n      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "",';
  });
  
  // also handle parameter-less GET calls
  const regex2 = new RegExp(`await ${fn}\\(\\)(\\s*)\\.then`, 'g');
  content = content.replace(regex2, match => {
    return `await ${fn}({ data: { accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "" } })` + match.substring(match.indexOf(')'));
  });
  
  // actually in api.ts some calls are like:
  // const res = await serverGetSocietiesWithStats();
  const regex3 = new RegExp(`await ${fn}\\(\\)(?!\\s*\\.)`, 'g');
  content = content.replace(regex3, `await ${fn}({ data: { accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "" } })`);
});

// Remove tempPassword from return objects in api.ts
content = content.replace(/tempPassword:\s*user\.tempPassword/g, '');
content = content.replace(/const password = user\.tempPassword;/g, 'const password = "";');

fs.writeFileSync('src/lib/api/api.ts', content);
console.log('Patched api.ts');
