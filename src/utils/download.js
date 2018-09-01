import JSZip from 'jszip';
/**
 * @param {Blob} blob
 * @param {string} name
 */
export function downloadBlob (blob, name) {
  let alink = window.document.createElement('a');
  let evt = window.document.createEvent('HTMLEvents');
  evt.initEvent('click', false, false);
  alink.download = name;
  alink.href = window.URL.createObjectURL(blob);
  alink.dispatchEvent(evt);
  alink.click();
}

export function buildZip ({
                            images=[],
                            jss=[],
                            csss=[],
                            htmls=[],
                            data
                          } = datas) {
  let zip = new JSZip();
  let img = zip.folder('images');
  let js = zip.folder('js');
  let css = zip.folder('css');
  images.forEach((image) => img.file(image.name, image.data));
  jss.forEach((jsFile) => js.file(jsFile.name, jsFile.data));
  csss.forEach((cssFile) => css.file(cssFile.name, cssFile.data));
  htmls.forEach((html) => zip.file(html.name, html.data));
  zip.file('data.json', JSON.stringify(data));
  return zip.generateAsync({type: 'blob'})
    .then(function (content) {
      return Promise.resolve(content);
    });
}

/**
 *
 * @param images
 * @param jss
 * @param csss
 * @param htmls
 * @param data
 * @returns {Promise<void>}
 */
export async function build(datas) {
  let content = await buildZip(datas);
  downloadBlob(content, 'all');
}
