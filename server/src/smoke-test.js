// End-to-end API check. Run with the server up:  npm test
const B = process.env.API || 'http://localhost:5000/api';
const call = async (m, p, body, tok) => {
  const r = await fetch(B + p, { method: m, headers: { 'Content-Type': 'application/json', ...(tok && { Authorization: 'Bearer ' + tok }) }, body: body && JSON.stringify(body) });
  return { status: r.status, data: await r.json() };
};
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) process.exitCode = 1; };
const email = `test${Date.now()}@demo.dev`;
let r = await call('POST', '/auth/signup', { name: 'Test User', email, password: 'secret123' });
ok(r.status === 201 && r.data.token, 'signup returns token'); const tok = r.data.token; const me = r.data.user.id;
ok((await call('POST', '/auth/signup', { name: 'x', email, password: 'secret123' })).status === 409, 'duplicate email rejected');
r = await call('POST', '/auth/login', { email, password: 'secret123' }); ok(r.status === 200, 'login works');
ok((await call('POST', '/auth/login', { email, password: 'wrong' })).status === 401, 'wrong password rejected');
ok((await call('POST', '/posts', { content: 'hi' })).status === 401, 'posting requires auth');
r = await call('POST', '/posts', { content: 'Hello DevConnect!' }, tok); ok(r.status === 201, 'create post');
const pid = r.data.id;
r = await call('GET', '/posts'); ok(r.data.some((p) => p.id === pid), 'post appears in feed');
r = await call('PUT', '/users/me', { name: 'Test User', headline: 'Tester', bio: 'b', skills: ['React', 'Node'] }, tok); ok(r.data.skills.length === 2, 'profile update');
r = await call('POST', '/users/1/follow', null, tok); ok(r.status === 200, 'follow user');
r = await call('GET', '/users/1', null, tok); ok(r.data.is_following === true, 'profile shows following');
r = await call('GET', '/posts?scope=following', null, tok); ok(r.data.some((p) => p.author_id === 1), 'following feed has followed users posts');
ok((await call('POST', `/users/${me}/follow`, null, tok)).status === 400, 'cannot follow self');
await call('DELETE', '/users/1/follow', null, tok); r = await call('GET', '/users/1', null, tok); ok(r.data.is_following === false, 'unfollow');
ok((await call('DELETE', '/posts/' + pid, null, tok)).status === 200, 'delete own post');
