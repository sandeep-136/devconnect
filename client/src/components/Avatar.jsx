// No image uploads: initials in a square tile. Colour comes from the name so each person is consistent.
const COLORS = ['#ff5a1f', '#1f6bff', '#12a150', '#7a3cff', '#e0a800', '#d6246e'];
export default function Avatar({ name = '?', size = 40 }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const c = COLORS[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length];
  return <div className="avatar" style={{ width: size, height: size, fontSize: size / 2.6, background: c }}>{initials}</div>;
}
