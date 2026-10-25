export async function runExportIfUnlocked(encrypt, isUnlocked, download) {
  const payload = await encrypt();
  if (!isUnlocked()) return false;
  download(payload);
  return true;
}
