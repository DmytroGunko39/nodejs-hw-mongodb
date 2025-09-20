export function getEnvVar(name) {
  const value = process.env[name];

  if (typeof value === 'undefined') {
    throw new Error(`Missing: process.env['${name}'].`);
  }
  return value;
}
