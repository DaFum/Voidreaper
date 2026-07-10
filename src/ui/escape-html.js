const HTML_ENTITIES=Object.freeze({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"});

export const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,character=>HTML_ENTITIES[character]);
export const safeImageDataUrl=value=>typeof value==="string"&&/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+=*$/i.test(value)?value:null;
