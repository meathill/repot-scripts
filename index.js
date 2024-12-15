import 'dotenv/config';
import { createZipAndJson, getUnhandled, updateEntry } from './utils.js';

const response = await fetch('https://prod-api.chainide.com/api/image/sui/version');
const { data: suiVersion } = await response.json();

// load unhandled protocols and contracts
const protocols = await getUnhandled('protocols');
console.log('Start to handle protocols:', protocols.length);
for (const protocol of protocols) {
  console.log('protocol', protocol.name);
  const root = protocol.document_link;
  const [zip, json] = await createZipAndJson(protocol.name, root, suiVersion);

  // update the protocol
  const result = await updateEntry('protocols', protocol.documentId, {
    ...protocol,
    document_zip: zip,
    document_json: json,
  });
  console.log('Protocol result:', result);
}

const contracts = await getUnhandled('contracts');
console.log('Start to handle contracts:', contracts.length);
for (const contract of contracts) {
  console.log('contract', contract.name);
  const root = contract.document_links;
  const [zip, json] = await createZipAndJson(contract.name, root, suiVersion);

  // update the contract
  const result = await updateEntry('contracts', contract.documentId, {
    ...contract,
    document_zip: zip,
    document_json: json,
  });
  console.log('Contract result:', result);
}

console.log('All done!');
