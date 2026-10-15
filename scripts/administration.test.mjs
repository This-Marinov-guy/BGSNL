import test from 'node:test';
import assert from 'node:assert/strict';
import { administrationAreas, canAdminister, statisticsRedirectPath } from '../src/util/administration.mjs';
import { accountRouteState } from '../src/util/functions/account-route-state.mjs';
import { browserApiPath } from '../src/util/auth/proxy-policy.mjs';
import nextConfig from '../next.config.mjs';
const available = (roles) => administrationAreas.filter((area) => canAdminister(area, roles)).map(({ id }) => id);
test('administration overview follows the existing role scopes', () => {
  assert.equal(available(['admin']).length, administrationAreas.length);
  assert.equal(available(['super_admin']).length, administrationAreas.length);
  assert.deepEqual(available(['member']), []);
  assert.deepEqual(available(['alumni']), []);
  const statistics = ['event-statistics', 'member-statistics'];
  assert.deepEqual(available(['support']), [...statistics, 'support']);
  assert.deepEqual(available(['committee_member']), [...statistics, 'events']);
  assert.deepEqual(available(['active_member']), [...statistics, 'events']);
  assert.deepEqual(available(['board_member']), [...statistics, 'events', 'members']);
  assert.deepEqual(available(['society_board_member']), [...statistics, 'events', 'members', 'internships']);
  assert.deepEqual(available(['national_board_member']), [...statistics, 'events', 'members', 'internships']);
  assert.deepEqual(available(['regional_board_member']), [...statistics, 'events', 'members']);
  assert.deepEqual(available(['regional_committee_member']), [...statistics, 'events']);
  assert.deepEqual(available(['national_committee_member']), [...statistics, 'events', 'members']);
  assert.deepEqual(available(['developer']), [...statistics, 'monitoring']);
});
test('ordinary members reach access requests but cannot open admin panels', () => {
  const user = { authInitialized: true, session: 'test', status: 'active', roles: ['member'] };
  assert.equal(accountRouteState(user, [], '/user/dashboard'), 'allowed');
  for (const area of administrationAreas) assert.equal(accountRouteState(user, area.roles, `/user/dashboard/${area.id}`), 'forbidden');
  assert.equal(accountRouteState({ ...user, session: null }, [], '/user/dashboard'), 'anonymous');
  assert.equal(accountRouteState({ ...user, status: 'suspended' }, [], '/user/dashboard'), 'locked');
});
test('access requests use only the explicit POST proxy route', () => {
  assert.equal(browserApiPath(['backoffice', 'access-requests'], 'POST'), 'backoffice/access-requests');
  assert.equal(browserApiPath(['backoffice', 'access-requests'], 'GET'), null);
  assert.equal(browserApiPath(['backoffice', 'access-requests', 'member-id'], 'POST'), null);
});
test('system manager jobs use the explicit read-only proxy route', () => {
  assert.equal(browserApiPath(['monitoring', 'jobs'], 'GET'), 'monitoring/jobs');
  assert.equal(browserApiPath(['monitoring', 'jobs'], 'POST'), null);
  assert.equal(browserApiPath(['monitoring', 'quotas'], 'GET'), 'monitoring/quotas');
  assert.equal(browserApiPath(['monitoring', 'quotas'], 'POST'), null);
});

test('statistics use explicit read-only proxy routes', () => {
  for (const path of ['member-statistics', 'event-statistics']) {
    assert.equal(browserApiPath(['dashboard', path], 'GET'), `dashboard/${path}`);
    assert.equal(browserApiPath(['dashboard', path], 'POST'), null);
  }
});

test('statistics belong to Metrics and legacy tab URLs retain their filters', () => {
  assert.deepEqual(administrationAreas.filter(area => area.section === 'metrics').map(area => area.id),
    ['event-statistics', 'member-statistics']);
  assert.equal(statisticsRedirectPath('event', { view: 'analytics', region: 'groningen', from: '2026-08-25' }),
    '/user/dashboard/metrics/events?region=groningen&from=2026-08-25');
  assert.equal(statisticsRedirectPath('member', { view: 'statistics', to: '2026-10-13', region: ['amsterdam', 'groningen'] }),
    '/user/dashboard/metrics/members?to=2026-10-13&region=amsterdam&region=groningen');
});

test('legacy route redirects open Metrics tabs', async () => {
  const redirects = await nextConfig.redirects();
  for (const source of ['/user/dashboard/event-statistics', '/user/dashboard/event-analytics', '/user/events-analytics']) {
    assert.equal(redirects.find(row => row.source === source)?.destination, '/user/dashboard/metrics/events');
  }
  for (const source of ['/user/dashboard/member-statistics', '/user/members']) {
    assert.equal(redirects.find(row => row.source === source)?.destination, '/user/dashboard/metrics/members');
  }
});


test('membership actions have explicit proxy methods and no arbitrary action routes', () => {
  const parts = ['backoffice', 'accounts', 'member', 'member_example'];
  assert.equal(browserApiPath([...parts, 'membership'], 'GET'), parts.join('/') + '/membership');
  assert.equal(browserApiPath([...parts, 'membership'], 'POST'), null);
  for (const action of ['transfer', 'cancel-subscription']) {
    assert.equal(browserApiPath([...parts, action], 'POST'), parts.join('/') + '/' + action);
    assert.equal(browserApiPath([...parts, action], 'GET'), null);
  }
  assert.equal(browserApiPath([...parts, 'delete-subscription'], 'POST'), null);
});
