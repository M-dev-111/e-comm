/** Landing route for each role — the one place that mapping lives. */
export const HOME_FOR = {
  super_admin: '/super-admin',
  admin: '/admin',
  vendor: '/vendor',
  customer: '/account'
}

export const homeFor = role => HOME_FOR[role] ?? '/'
