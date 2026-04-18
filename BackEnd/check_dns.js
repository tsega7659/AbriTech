const dns = require('dns');

const hostname = 'aws-1-eu-west-1.pooler.supabase.com';

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('DNS Lookup Error:', err);
  } else {
    console.log('Address:', address);
    console.log('Family: IPv', family);
  }
});

dns.resolve4(hostname, (err, addresses) => {
  if (err) {
    console.error('DNS Resolve Error:', err);
  } else {
    console.log('Addresses:', addresses);
  }
});
