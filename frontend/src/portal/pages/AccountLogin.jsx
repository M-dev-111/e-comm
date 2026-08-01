import PortalLoginCard from '../components/PortalLoginCard'

/** Real backend account for customers — separate from the storefront's local
 *  mock AuthContext. Needed so a customer can apply to become a vendor. */
export default function AccountLogin () {
  return (
    <PortalLoginCard
      title='Your account'
      subtitle='Sign in to apply to become a vendor'
      expectedRole='customer'
      redirectTo='/account'
      registerPath='/account/register'
    />
  )
}
