import test from 'node:test';
import assert from 'node:assert/strict';
import { administrationAreas, canAdminister } from '../src/util/administration.mjs';
import { accountRouteState } from '../src/util/functions/account-route-state.mjs';
import { browserApiPath } from '../src/util/auth/proxy-policy.mjs';
const available = (roles) => administrationAreas.filter((area) => canAdminister(area, roles)).map(({ id }) => id);
test('administration overview follows the existing role scopes', () => {
  assert.equal(available(['admin']).length, administrationAreas.length);
  assert.equal(available(['super_admin']).length, administrationAreas.length);
  assert.deepEqual(available(['member']), []);
  assert.deepEqual(available(['alumni']), []);
  assert.deepEqual(available(['support']), ['support']);
  assert.deepEqual(available(['committee_member']), ['events']);
  assert.deepEqual(available(['active_member']), ['events']);
  assert.deepEqual(available(['board_member']), ['events', 'members']);
  assert.deepEqual(available(['society_board_member']), ['events', 'internships', 'members']);
  assert.deepEqual(available(['national_board_member']), ['events', 'internships', 'members']);
  assert.deepEqual(available(['regional_board_member']), ['events', 'members']);
  assert.deepEqual(available(['regional_committee_member']), ['events']);
  assert.deepEqual(available(['national_committee_member']), ['events', 'members']);
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
