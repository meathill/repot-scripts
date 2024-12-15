import JSZip from "jszip";
import slugify from "slugify";

export async function getUnhandled(type) {
  const field = type === 'protocols' ? 'document_link' : 'document_links';
  const url = new URL(`${process.env.STRAPI_ENDPOINT}/api/${type}`);
  url.searchParams.set('pagination[page]', 1);
  url.searchParams.set('pagination[pageSize]', 1);
  url.searchParams.set('filters[document_zip][$is]', null);
  url.searchParams.set(`filters[${field}][$notNull]`, 1);
  const response = await fetch(url, {
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
    },
  });
  const data = await response.json();
  return data.data;
}

export async function getAllCodesFromDirectory(link) {
  const url = new URL(`https://repot.dev/api/s3/getDirContent`);
  url.searchParams.set('dir', link);
  const response = await fetch(url, {
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${process.env.CRON_TOKEN}`,
    },
  });
  return await response.json();
}

export async function uploadZip(codes, name) {
  const zip = new JSZip();
  for (const code of codes) {
    zip.file(code.name, code.content);
  }
  const content = await zip.generateAsync({type:"nodebuffer"});
  const formData = new FormData();
  const blob = new Blob([content], { type: 'application/zip' });
  formData.append('files', blob, `${slugify(name)}.zip`);
  const response = await fetch(`${process.env.STRAPI_ENDPOINT}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
    },
    body: formData,
  });
  const data = await response.json();
  return data.data;
}

export async function uploadJson(codes, name) {
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(codes)], { type: 'application/json' });
  formData.append('files', blob, `${slugify(name)}.json`);
  const response = await fetch(`${process.env.STRAPI_ENDPOINT}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
    },
    body: formData,
  });
  const data = await response.json();
  return data.data;
}

export async function updateEntry(type, id, data) {
  const response = await fetch(`${process.env.STRAPI_ENDPOINT}/api/${type}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
    },
    body: JSON.stringify(data),
  });
  await response.json();
}

export async function createZipAndJson(name, root, suiVersion) {
  const codes = await getAllCodesFromDirectory(root);

  // save a zip file
  const zipUrl = await uploadZip(codes, name);

  // save a json file
  if (suiVersion) {
    codes.map(item => {
      if (!item) return item;

      item.content = item.content.replaceAll(
        'rev = "framework/testnet"',
        `rev = "${suiVersion}"`
      );
      return item;
    });
  }
  const jsonUrl = await uploadJson(codes, name);

  return [zipUrl, jsonUrl];
}