/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Sign up, login, sessions, and account lifecycle
 *   - name: Users
 *     description: User directory and customer management
 *   - name: Salons
 *     description: Salon profiles, settings, and public info
 *   - name: Staff
 *     description: Staff accounts, roles, metrics, and portal access
 *   - name: Services
 *     description: Service catalog management
 *   - name: Appointments
 *     description: Appointment booking and management
 *   - name: Bookings
 *     description: Customer/staff booking workflow and time-off
 *   - name: Payments
 *     description: Payments, checkout, and webhooks
 *   - name: Subscriptions
 *     description: Subscription checkout and status
 *   - name: Loyalty
 *     description: Loyalty points and configuration
 *   - name: Notifications
 *     description: Notifications, reminders, and promotions
 *   - name: Messages
 *     description: Messaging between salons and customers
 *   - name: Reviews
 *     description: Reviews and responses
 *   - name: Photos
 *     description: Service photos and salon gallery
 *   - name: Shop
 *     description: Retail products and cart
 *   - name: Analytics
 *     description: Analytics for owners/admins
 *   - name: Admin
 *     description: Platform admin reports and verification
 *   - name: Account
 *     description: Account settings and subscription management
 *   - name: History
 *     description: Appointment and visit history
 */

/**
 * @swagger
 * paths:
 *   /api/auth/signup:
 *     post:
 *       tags: [Auth]
 *       summary: Sign up with email and password
 *       responses:
 *         200:
 *           description: Account created
 *   /api/auth/login:
 *     post:
 *       tags: [Auth]
 *       summary: Login with email and password
 *       responses:
 *         200:
 *           description: Login successful
 *   /api/auth/forgot-password:
 *     post:
 *       tags: [Auth]
 *       summary: Request password reset email
 *       responses:
 *         200:
 *           description: Reset email sent
 *   /api/auth/reset-password:
 *     post:
 *       tags: [Auth]
 *       summary: Reset password with token
 *       responses:
 *         200:
 *           description: Password reset
 *   /api/auth/customer/set-password:
 *     post:
 *       tags: [Auth]
 *       summary: Set password from emailed token for customers
 *       responses:
 *         200:
 *           description: Password set
 *   /api/auth/setup-admin:
 *     post:
 *       tags: [Auth]
 *       summary: Initial admin setup
 *       responses:
 *         200:
 *           description: Admin created
 *   /api/auth/profile:
 *     get:
 *       tags: [Auth]
 *       summary: Get profile for provided JWT
 *       responses:
 *         200:
 *           description: Profile returned
 *   /api/auth/verify-firebase:
 *     post:
 *       tags: [Auth]
 *       summary: Verify Firebase ID token and return JWT
 *       responses:
 *         200:
 *           description: Token verified
 *   /api/auth/set-role:
 *     post:
 *       tags: [Auth]
 *       summary: Create user with Firebase UID and assign role
 *       responses:
 *         200:
 *           description: Role set
 *   /api/auth/me:
 *     get:
 *       tags: [Auth]
 *       summary: Get current authenticated user (flex auth)
 *       responses:
 *         200:
 *           description: Current user returned
 *   /api/auth/logout:
 *     post:
 *       tags: [Auth]
 *       summary: Logout and clear session cookie
 *       responses:
 *         200:
 *           description: Logged out
 *   /api/auth/2fa/status:
 *     get:
 *       tags: [Auth]
 *       summary: Get 2FA enablement status
 *       responses:
 *         200:
 *           description: 2FA status
 *   /api/auth/2fa/enable:
 *     post:
 *       tags: [Auth]
 *       summary: Enable 2FA for account
 *       responses:
 *         200:
 *           description: 2FA enabled
 *   /api/auth/2fa/disable:
 *     post:
 *       tags: [Auth]
 *       summary: Disable 2FA for account
 *       responses:
 *         200:
 *           description: 2FA disabled
 *   /api/auth/verify-2fa:
 *     post:
 *       tags: [Auth]
 *       summary: Verify 2FA code during login
 *       responses:
 *         200:
 *           description: 2FA verified
 *   /api/auth/refresh:
 *     post:
 *       tags: [Auth]
 *       summary: Refresh JWT
 *       responses:
 *         200:
 *           description: Token refreshed
 *   /api/auth/delete-account:
 *     delete:
 *       tags: [Auth]
 *       summary: Delete current account
 *       responses:
 *         200:
 *           description: Account deleted
 *   /api/auth/me-test:
 *     get:
 *       tags: [Auth]
 *       summary: Test endpoint to validate JWT parsing
 *       responses:
 *         200:
 *           description: Auth OK
 */

/**
 * @swagger
 * paths:
 *   /api/users:
 *     get:
 *       tags: [Users]
 *       summary: Admin list of all users
 *       responses:
 *         200:
 *           description: Users returned
 *   /api/users/me:
 *     get:
 *       tags: [Users]
 *       summary: Get current user profile
 *       responses:
 *         200:
 *           description: Current user
 *   /api/users/customers:
 *     get:
 *       tags: [Users]
 *       summary: Admin/owner list of customers
 *       responses:
 *         200:
 *           description: Customers returned
 *   /api/users/salon-customers:
 *     get:
 *       tags: [Users]
 *       summary: Get customers for current salon
 *       responses:
 *         200:
 *           description: Salon customers returned
 *     post:
 *       tags: [Users]
 *       summary: Add a customer to current salon
 *       responses:
 *         200:
 *           description: Customer created
 *   /api/users/salon-customers/stats:
 *     get:
 *       tags: [Users]
 *       summary: Get salon customer stats
 *       responses:
 *         200:
 *           description: Stats returned
 *   /api/users/salon-customers/directory:
 *     get:
 *       tags: [Users]
 *       summary: Salon customer directory
 *       responses:
 *         200:
 *           description: Directory returned
 *   /api/users/salon-customers/{userId}:
 *     put:
 *       tags: [Users]
 *       summary: Update salon customer
 *       parameters:
 *         - in: path
 *           name: userId
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Customer updated
 *     delete:
 *       tags: [Users]
 *       summary: Delete salon customer
 *       parameters:
 *         - in: path
 *           name: userId
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Customer deleted
 *   /api/users/{id}:
 *     get:
 *       tags: [Users]
 *       summary: Get user by ID (self or admin)
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: User returned
 *     put:
 *       tags: [Users]
 *       summary: Update user (self or admin)
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: User updated
 *     delete:
 *       tags: [Users]
 *       summary: Delete user (admin)
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: User deleted
 */

/**
 * @swagger
 * paths:
 *   /api/salons:
 *     get:
 *       tags: [Salons]
 *       summary: List salons (authenticated)
 *       responses:
 *         200:
 *           description: Salons returned
 *     post:
 *       tags: [Salons]
 *       summary: Create a salon (with uploads)
 *       responses:
 *         200:
 *           description: Salon created
 *   /api/salons/check-owner:
 *     get:
 *       tags: [Salons]
 *       summary: Check if current user owns a salon
 *       responses:
 *         200:
 *           description: Ownership status
 *   /api/salons/{salonId}/staff:
 *     get:
 *       tags: [Salons]
 *       summary: Get staff by salon ID
 *       parameters:
 *         - in: path
 *           name: salonId
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Staff list
 *   /api/salons/staff/schedule:
 *     get:
 *       tags: [Salons]
 *       summary: Get daily schedule for salon staff
 *       responses:
 *         200:
 *           description: Schedule returned
 *   /api/salons/user/visit-history:
 *     get:
 *       tags: [Salons]
 *       summary: Get visit history for current user
 *       responses:
 *         200:
 *           description: Visit history returned
 *   /api/salons/customers/{customer_id}/history:
 *     get:
 *       tags: [Salons]
 *       summary: Get visit history for a specific customer
 *       parameters:
 *         - in: path
 *           name: customer_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: History returned
 *   /api/salons/{salon_id}/services:
 *     get:
 *       tags: [Salons]
 *       summary: Get salon services (authenticated)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Services returned
 *   /api/salons/{salon_id}/products:
 *     get:
 *       tags: [Salons]
 *       summary: Get salon products (authenticated)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Products returned
 *   /api/salons/public/{salon_id}/services:
 *     get:
 *       tags: [Salons]
 *       summary: Public services for salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Services returned
 *   /api/salons/public/{salon_id}/products:
 *     get:
 *       tags: [Salons]
 *       summary: Public products for salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Products returned
 *   /api/salons/{salon_id}/business-hours:
 *     get:
 *       tags: [Salons]
 *       summary: Get business hours (auth)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Hours returned
 *     put:
 *       tags: [Salons]
 *       summary: Update business hours
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Hours updated
 *   /api/salons/{salon_id}/notification-settings:
 *     get:
 *       tags: [Salons]
 *       summary: Get notification settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Settings returned
 *     put:
 *       tags: [Salons]
 *       summary: Update notification settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Settings updated
 *   /api/salons/{salon_id}/amenities:
 *     get:
 *       tags: [Salons]
 *       summary: Get salon amenities
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Amenities returned
 *     put:
 *       tags: [Salons]
 *       summary: Update salon amenities
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Amenities updated
 *   /api/salons/{salon_id}/booking-settings:
 *     get:
 *       tags: [Salons]
 *       summary: Get booking settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Booking settings returned
 *     put:
 *       tags: [Salons]
 *       summary: Update booking settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Booking settings updated
 *   /api/salons/{salon_id}/loyalty-settings:
 *     get:
 *       tags: [Salons]
 *       summary: Get loyalty settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Loyalty settings returned
 *     put:
 *       tags: [Salons]
 *       summary: Update loyalty settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Loyalty settings updated
 *   /api/salons/{salon_id}/slot-settings:
 *     get:
 *       tags: [Salons]
 *       summary: Get slot settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Slot settings returned
 *     put:
 *       tags: [Salons]
 *       summary: Update slot settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Slot settings updated
 *   /api/salons/{salon_id}/review-settings:
 *     get:
 *       tags: [Salons]
 *       summary: Get review settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Review settings returned
 *     put:
 *       tags: [Salons]
 *       summary: Update review settings
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Review settings updated
 *   /api/salons/{salon_id}/reviews:
 *     get:
 *       tags: [Salons]
 *       summary: Get salon reviews (authenticated view)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Reviews returned
 *   /api/salons/{salon_id}/operating-policies:
 *     get:
 *       tags: [Salons]
 *       summary: Get operating policies
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Policies returned
 *     put:
 *       tags: [Salons]
 *       summary: Update operating policies
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Policies updated
 *   /api/salons/public/{salon_id}:
 *     get:
 *       tags: [Salons]
 *       summary: Public salon details
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Salon returned
 *   /api/salons/public/{salon_id}/business-hours:
 *     get:
 *       tags: [Salons]
 *       summary: Public business hours
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Hours returned
 *   /api/salons/public/{salon_id}/booking-policy:
 *     get:
 *       tags: [Salons]
 *       summary: Public booking policy
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Policy returned
 *   /api/salons/public/{salon_id}/reviews:
 *     get:
 *       tags: [Salons]
 *       summary: Public salon reviews
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Reviews returned
 *   /api/salons/{salon_id}:
 *     get:
 *       tags: [Salons]
 *       summary: Get salon by ID (authenticated)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Salon returned
 *     put:
 *       tags: [Salons]
 *       summary: Update salon by ID (with uploads)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Salon updated
 */

/**
 * @swagger
 * paths:
 *   /api/staff/login:
 *     post:
 *       tags: [Staff]
 *       summary: Staff login with PIN
 *       responses:
 *         200:
 *           description: Logged in
 *   /api/staff/set-pin:
 *     post:
 *       tags: [Staff]
 *       summary: Set or reset staff PIN
 *       responses:
 *         200:
 *           description: PIN set
 *   /api/staff/public/salon/{id}:
 *     get:
 *       tags: [Staff]
 *       summary: Public staff list for salon
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Staff returned
 *   /api/staff/salon/{id}/staff:
 *     get:
 *       tags: [Staff]
 *       summary: Public staff list (customer view)
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Staff returned
 *   /api/staff/staff_roles:
 *     get:
 *       tags: [Staff]
 *       summary: Get staff roles
 *       responses:
 *         200:
 *           description: Roles returned
 *     post:
 *       tags: [Staff]
 *       summary: Add staff role
 *       responses:
 *         200:
 *           description: Role added
 *   /api/staff/staff:
 *     post:
 *       tags: [Staff]
 *       summary: Add staff member (owner/admin)
 *       responses:
 *         200:
 *           description: Staff added
 *   /api/staff/staff/{id}:
 *     put:
 *       tags: [Staff]
 *       summary: Update staff member
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Staff updated
 *     get:
 *       tags: [Staff]
 *       summary: Get staff member
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Staff returned
 *     delete:
 *       tags: [Staff]
 *       summary: Delete staff member
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Staff deleted
 *   /api/staff/count:
 *     get:
 *       tags: [Staff]
 *       summary: Get staff count
 *       responses:
 *         200:
 *           description: Count returned
 *   /api/staff/avg:
 *     get:
 *       tags: [Staff]
 *       summary: Get average revenue per staff
 *       responses:
 *         200:
 *           description: Average returned
 *   /api/staff/efficiency/{id}:
 *     get:
 *       tags: [Staff]
 *       summary: Get efficiency for staff member
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Efficiency returned
 *   /api/staff/efficiency:
 *     get:
 *       tags: [Staff]
 *       summary: Get average efficiency
 *       responses:
 *         200:
 *           description: Efficiency returned
 *   /api/staff/revenue/{id}:
 *     get:
 *       tags: [Staff]
 *       summary: Get revenue for staff member
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Revenue returned
 */

/**
 * @swagger
 * paths:
 *   /api/staff-portal/login:
 *     post:
 *       tags: [Staff]
 *       summary: Staff portal login
 *       responses:
 *         200:
 *           description: Logged in
 *   /api/staff-portal/me:
 *     get:
 *       tags: [Staff]
 *       summary: Get portal profile
 *       responses:
 *         200:
 *           description: Profile returned
 *   /api/staff-portal/dashboard:
 *     get:
 *       tags: [Staff]
 *       summary: Staff portal dashboard stats
 *       responses:
 *         200:
 *           description: Dashboard returned
 *   /api/staff-portal/appointments:
 *     get:
 *       tags: [Staff]
 *       summary: List staff appointments
 *       responses:
 *         200:
 *           description: Appointments returned
 *   /api/staff-portal/salon/appointments:
 *     get:
 *       tags: [Staff]
 *       summary: List salon appointments for staff
 *       responses:
 *         200:
 *           description: Appointments returned
 *   /api/staff-portal/appointments/{id}:
 *     get:
 *       tags: [Staff]
 *       summary: Get appointment detail
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Appointment returned
 *   /api/staff-portal/appointments/{id}/status:
 *     patch:
 *       tags: [Staff]
 *       summary: Update appointment status
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Status updated
 *   /api/staff-portal/customers:
 *     get:
 *       tags: [Staff]
 *       summary: List customers in portal
 *       responses:
 *         200:
 *           description: Customers returned
 *   /api/staff-portal/retail:
 *     get:
 *       tags: [Staff]
 *       summary: Retail products for staff portal
 *       responses:
 *         200:
 *           description: Retail returned
 *   /api/staff-portal/team:
 *     get:
 *       tags: [Staff]
 *       summary: Team directory for portal
 *       responses:
 *         200:
 *           description: Team returned
 *   /api/staff-portal/availability:
 *     get:
 *       tags: [Staff]
 *       summary: Get staff availability
 *       responses:
 *         200:
 *           description: Availability returned
 *     put:
 *       tags: [Staff]
 *       summary: Update staff availability
 *       responses:
 *         200:
 *           description: Availability updated
 */

/**
 * @swagger
 * paths:
 *   /api/services:
 *     post:
 *       tags: [Services]
 *       summary: Create a service
 *       responses:
 *         200:
 *           description: Service created
 *   /api/services/{id}:
 *     put:
 *       tags: [Services]
 *       summary: Update a service
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Service updated
 *     delete:
 *       tags: [Services]
 *       summary: Delete a service
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Service deleted
 */

/**
 * @swagger
 * paths:
 *   /api/appointments/create:
 *     post:
 *       tags: [Appointments]
 *       summary: Create an appointment
 *       responses:
 *         200:
 *           description: Appointment created
 *   /api/appointments/create/{id}:
 *     get:
 *       tags: [Appointments]
 *       summary: Get appointment (legacy path)
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Appointment returned
 *   /api/appointments/salon:
 *     get:
 *       tags: [Appointments]
 *       summary: Get appointments for salon
 *       responses:
 *         200:
 *           description: Appointments returned
 *   /api/appointments/salon-stats:
 *     get:
 *       tags: [Appointments]
 *       summary: Get salon appointment stats
 *       responses:
 *         200:
 *           description: Stats returned
 *   /api/appointments:
 *     get:
 *       tags: [Appointments]
 *       summary: Get appointments for current customer
 *       responses:
 *         200:
 *           description: Appointments returned
 *   /api/appointments/{id}:
 *     get:
 *       tags: [Appointments]
 *       summary: Get appointment by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Appointment returned
 *     put:
 *       tags: [Appointments]
 *       summary: Update appointment
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Appointment updated
 *     delete:
 *       tags: [Appointments]
 *       summary: Delete appointment
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Appointment deleted
 */

/**
 * @swagger
 * paths:
 *   /api/bookings/slots:
 *     get:
 *       tags: [Bookings]
 *       summary: Public available time slots
 *       responses:
 *         200:
 *           description: Slots returned
 *   /api/bookings/available:
 *     get:
 *       tags: [Bookings]
 *       summary: Available barbers and slots for customer
 *       responses:
 *         200:
 *           description: Availability returned
 *   /api/bookings/book:
 *     post:
 *       tags: [Bookings]
 *       summary: Book appointment (customer)
 *       responses:
 *         200:
 *           description: Booking created
 *   /api/bookings/reschedule/{id}:
 *     put:
 *       tags: [Bookings]
 *       summary: Reschedule appointment
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Booking rescheduled
 *   /api/bookings/cancel/{id}:
 *     delete:
 *       tags: [Bookings]
 *       summary: Cancel appointment
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Booking canceled
 *   /api/bookings/barber/schedule:
 *     get:
 *       tags: [Bookings]
 *       summary: Barber daily schedule
 *       responses:
 *         200:
 *           description: Schedule returned
 *   /api/bookings/barber/block-slot:
 *     post:
 *       tags: [Bookings]
 *       summary: Block a time slot
 *       responses:
 *         200:
 *           description: Slot blocked
 *   /api/bookings/barber/blocked-slots:
 *     get:
 *       tags: [Bookings]
 *       summary: Get blocked time slots
 *       responses:
 *         200:
 *           description: Blocked slots returned
 *   /api/bookings/barber/blocked-slots/{timeoff_id}:
 *     put:
 *       tags: [Bookings]
 *       summary: Update blocked time slot
 *       parameters:
 *         - in: path
 *           name: timeoff_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Blocked slot updated
 *     delete:
 *       tags: [Bookings]
 *       summary: Delete blocked time slot
 *       parameters:
 *         - in: path
 *           name: timeoff_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Blocked slot deleted
 */

/**
 * @swagger
 * paths:
 *   /api/payments/checkout:
 *     post:
 *       tags: [Payments]
 *       summary: Create checkout session for services
 *       responses:
 *         200:
 *           description: Checkout created
 *   /api/payments/unified-checkout:
 *     post:
 *       tags: [Payments]
 *       summary: Create unified checkout (services + products)
 *       responses:
 *         200:
 *           description: Checkout created
 *   /api/payments/pay-in-store:
 *     post:
 *       tags: [Payments]
 *       summary: Create pay-in-store payment
 *       responses:
 *         200:
 *           description: Payment created
 *   /api/payments/salon/{salon_id}:
 *     get:
 *       tags: [Payments]
 *       summary: Get payments for a salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Payments returned
 *   /api/payments/session:
 *     get:
 *       tags: [Payments]
 *       summary: Get payment by session ID
 *       responses:
 *         200:
 *           description: Payment returned
 *   /api/payments/webhook:
 *     post:
 *       tags: [Payments]
 *       summary: Stripe webhook endpoint
 *       responses:
 *         200:
 *           description: Webhook processed
 */

/**
 * @swagger
 * paths:
 *   /api/subscriptions/checkout:
 *     post:
 *       tags: [Subscriptions]
 *       summary: Create subscription checkout
 *       responses:
 *         200:
 *           description: Checkout created
 *   /api/subscriptions/history:
 *     get:
 *       tags: [Subscriptions]
 *       summary: Get subscription history
 *       responses:
 *         200:
 *           description: History returned
 *   /api/subscriptions/status:
 *     get:
 *       tags: [Subscriptions]
 *       summary: Get current subscription status
 *       responses:
 *         200:
 *           description: Status returned
 */

/**
 * @swagger
 * paths:
 *   /api/loyalty/my-summary:
 *     get:
 *       tags: [Loyalty]
 *       summary: Get loyalty summary for current user
 *       responses:
 *         200:
 *           description: Summary returned
 *   /api/loyalty/my-points/{salon_id}:
 *     get:
 *       tags: [Loyalty]
 *       summary: Get loyalty points for current user at salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Points returned
 *   /api/loyalty/redeem:
 *     post:
 *       tags: [Loyalty]
 *       summary: Redeem loyalty points
 *       responses:
 *         200:
 *           description: Points redeemed
 *   /api/loyalty/calculate-discount:
 *     post:
 *       tags: [Loyalty]
 *       summary: Calculate loyalty discount
 *       responses:
 *         200:
 *           description: Discount calculated
 *   /api/loyalty/earn:
 *     post:
 *       tags: [Loyalty]
 *       summary: Manually award loyalty points
 *       responses:
 *         200:
 *           description: Points awarded
 *   /api/loyalty/{user_id}/{salon_id}:
 *     get:
 *       tags: [Loyalty]
 *       summary: Get loyalty points for user and salon
 *       parameters:
 *         - in: path
 *           name: user_id
 *           required: true
 *           schema:
 *             type: integer
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Points returned
 *   /api/loyalty/config:
 *     post:
 *       tags: [Loyalty]
 *       summary: Set loyalty configuration for salon
 *       responses:
 *         200:
 *           description: Config saved
 *   /api/loyalty/config/{salon_id}:
 *     get:
 *       tags: [Loyalty]
 *       summary: Get loyalty config for salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Config returned
 */

/**
 * @swagger
 * paths:
 *   /api/notifications/reminder:
 *     post:
 *       tags: [Notifications]
 *       summary: Send appointment reminder
 *       responses:
 *         200:
 *           description: Reminder sent
 *   /api/notifications/promotion:
 *     post:
 *       tags: [Notifications]
 *       summary: Send promotional offer
 *       responses:
 *         200:
 *           description: Promotion sent
 *   /api/notifications/delay:
 *     post:
 *       tags: [Notifications]
 *       summary: Notify client about delay
 *       responses:
 *         200:
 *           description: Delay sent
 *   /api/notifications/discount:
 *     post:
 *       tags: [Notifications]
 *       summary: Notify user of discount
 *       responses:
 *         200:
 *           description: Discount sent
 *   /api/notifications:
 *     get:
 *       tags: [Notifications]
 *       summary: Get current user notifications
 *       responses:
 *         200:
 *           description: Notifications returned
 *   /api/notifications/{id}/read:
 *     put:
 *       tags: [Notifications]
 *       summary: Mark notification as read
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Notification marked read
 *   /api/notifications/read-all:
 *     put:
 *       tags: [Notifications]
 *       summary: Mark all notifications as read
 *       responses:
 *         200:
 *           description: Notifications marked read
 *   /api/notifications/loyal-customers:
 *     post:
 *       tags: [Notifications]
 *       summary: Get loyal customers for promotions
 *       responses:
 *         200:
 *           description: Customers returned
 *   /api/notifications/send-promotion:
 *     post:
 *       tags: [Notifications]
 *       summary: Send promotion to customers
 *       responses:
 *         200:
 *           description: Promotion sent
 */

/**
 * @swagger
 * paths:
 *   /api/messages:
 *     post:
 *       tags: [Messages]
 *       summary: Send a message
 *       responses:
 *         200:
 *           description: Message sent
 *   /api/messages/salon/{salon_id}:
 *     get:
 *       tags: [Messages]
 *       summary: Get messages for salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Messages returned
 *   /api/messages/salon/{salon_id}/customers:
 *     get:
 *       tags: [Messages]
 *       summary: Get customers with messages for salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Customers returned
 *   /api/messages/salon/{salon_id}/conversation/{customer_id}:
 *     get:
 *       tags: [Messages]
 *       summary: Get conversation with customer
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *         - in: path
 *           name: customer_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Conversation returned
 */

/**
 * @swagger
 * paths:
 *   /api/reviews/add:
 *     post:
 *       tags: [Reviews]
 *       summary: Add review for a salon
 *       responses:
 *         200:
 *           description: Review added
 *   /api/reviews/respond/{id}:
 *     put:
 *       tags: [Reviews]
 *       summary: Respond to a review
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Response saved
 *   /api/reviews/{id}:
 *     put:
 *       tags: [Reviews]
 *       summary: Update a review
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Review updated
 *     delete:
 *       tags: [Reviews]
 *       summary: Delete a review
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Review deleted
 *   /api/reviews/salon/{salon_id}:
 *     get:
 *       tags: [Reviews]
 *       summary: Get reviews for salon (optionally authed)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Reviews returned
 *   /api/reviews/{salon_id}:
 *     get:
 *       tags: [Reviews]
 *       summary: Get reviews for salon (alt path)
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Reviews returned
 */

/**
 * @swagger
 * paths:
 *   /api/photos/add:
 *     post:
 *       tags: [Photos]
 *       summary: Add service photo (upload)
 *       responses:
 *         200:
 *           description: Photo added
 *   /api/photos/user/{user_id}:
 *     get:
 *       tags: [Photos]
 *       summary: Get photos for user
 *       parameters:
 *         - in: path
 *           name: user_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Photos returned
 *   /api/photos/{appointment_id}:
 *     get:
 *       tags: [Photos]
 *       summary: Get photos for appointment
 *       parameters:
 *         - in: path
 *           name: appointment_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Photos returned
 *   /api/photos/salon/{salon_id}:
 *     get:
 *       tags: [Photos]
 *       summary: Get salon gallery
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Gallery returned
 *   /api/photos/salon:
 *     post:
 *       tags: [Photos]
 *       summary: Add photo to salon gallery (upload)
 *       responses:
 *         200:
 *           description: Photo added
 *   /api/photos/salon/{photo_id}:
 *     delete:
 *       tags: [Photos]
 *       summary: Delete salon photo
 *       parameters:
 *         - in: path
 *           name: photo_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Photo deleted
 */

/**
 * @swagger
 * paths:
 *   /api/shop/add-product:
 *     post:
 *       tags: [Shop]
 *       summary: Add retail product
 *       responses:
 *         200:
 *           description: Product added
 *   /api/shop/update-product/{product_id}:
 *     put:
 *       tags: [Shop]
 *       summary: Update retail product
 *       parameters:
 *         - in: path
 *           name: product_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Product updated
 *   /api/shop/products/{salon_id}:
 *     get:
 *       tags: [Shop]
 *       summary: Get salon products
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Products returned
 *   /api/shop/add-to-cart:
 *     post:
 *       tags: [Shop]
 *       summary: Add product to cart
 *       responses:
 *         200:
 *           description: Added to cart
 *   /api/shop/add-appointment-to-cart:
 *     post:
 *       tags: [Shop]
 *       summary: Add appointment to cart
 *       responses:
 *         200:
 *           description: Added to cart
 *   /api/shop/cart:
 *     get:
 *       tags: [Shop]
 *       summary: Get current cart
 *       responses:
 *         200:
 *           description: Cart returned
 *   /api/shop/unified-cart:
 *     get:
 *       tags: [Shop]
 *       summary: Get unified cart (services + products)
 *       responses:
 *         200:
 *           description: Unified cart returned
 *   /api/shop/cart/{item_id}:
 *     delete:
 *       tags: [Shop]
 *       summary: Remove item from cart
 *       parameters:
 *         - in: path
 *           name: item_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Item removed
 *   /api/shop/cart-services:
 *     delete:
 *       tags: [Shop]
 *       summary: Remove all service items from cart
 *       responses:
 *         200:
 *           description: Items removed
 *   /api/shop/checkout:
 *     post:
 *       tags: [Shop]
 *       summary: Checkout cart (legacy)
 *       responses:
 *         200:
 *           description: Checkout created
 */

/**
 * @swagger
 * paths:
 *   /api/analytics/overview:
 *     get:
 *       tags: [Analytics]
 *       summary: Overview analytics for salon
 *       responses:
 *         200:
 *           description: Overview returned
 *   /api/analytics/revenue-series:
 *     get:
 *       tags: [Analytics]
 *       summary: Revenue series data
 *       responses:
 *         200:
 *           description: Series returned
 *   /api/analytics/service-distribution:
 *     get:
 *       tags: [Analytics]
 *       summary: Service distribution data
 *       responses:
 *         200:
 *           description: Distribution returned
 *   /api/analytics/dashboard:
 *     get:
 *       tags: [Analytics]
 *       summary: Dashboard analytics
 *       responses:
 *         200:
 *           description: Dashboard returned
 */

/**
 * @swagger
 * paths:
 *   /api/admins/user-engagement:
 *     get:
 *       tags: [Admin]
 *       summary: Platform user engagement stats
 *       responses:
 *         200:
 *           description: Stats returned
 *   /api/admins/appointment-trends:
 *     get:
 *       tags: [Admin]
 *       summary: Appointment trends
 *       responses:
 *         200:
 *           description: Trends returned
 *   /api/admins/salon-revenues:
 *     get:
 *       tags: [Admin]
 *       summary: Salon revenues overview
 *       responses:
 *         200:
 *           description: Revenues returned
 *   /api/admins/loyalty-usage:
 *     get:
 *       tags: [Admin]
 *       summary: Loyalty usage analytics
 *       responses:
 *         200:
 *           description: Usage returned
 *   /api/admins/user-demographics:
 *     get:
 *       tags: [Admin]
 *       summary: User demographics analytics
 *       responses:
 *         200:
 *           description: Demographics returned
 *   /api/admins/customer-retention:
 *     get:
 *       tags: [Admin]
 *       summary: Customer retention metrics
 *       responses:
 *         200:
 *           description: Retention returned
 *   /api/admins/reports:
 *     get:
 *       tags: [Admin]
 *       summary: Platform reports
 *       responses:
 *         200:
 *           description: Reports returned
 *   /api/admins/system-logs:
 *     get:
 *       tags: [Admin]
 *       summary: Platform system logs
 *       responses:
 *         200:
 *           description: Logs returned
 *   /api/admins/pending-salons:
 *     get:
 *       tags: [Admin]
 *       summary: List pending salon registrations
 *       responses:
 *         200:
 *           description: Pending salons returned
 *   /api/admins/verify/{salon_id}:
 *     post:
 *       tags: [Admin]
 *       summary: Verify salon registration
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Salon verified
 *   /api/admins/verify/{sid}:
 *     post:
 *       tags: [Admin]
 *       summary: Verify salon registration (short param)
 *       parameters:
 *         - in: path
 *           name: sid
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Salon verified
 */

/**
 * @swagger
 * paths:
 *   /api/account/settings:
 *     get:
 *       tags: [Account]
 *       summary: Get account settings
 *       responses:
 *         200:
 *           description: Settings returned
 *     put:
 *       tags: [Account]
 *       summary: Update account settings
 *       responses:
 *         200:
 *           description: Settings updated
 *   /api/account/password:
 *     put:
 *       tags: [Account]
 *       summary: Change password
 *       responses:
 *         200:
 *           description: Password changed
 *   /api/account/subscription/plans:
 *     get:
 *       tags: [Account]
 *       summary: Get available subscription plans
 *       responses:
 *         200:
 *           description: Plans returned
 *   /api/account/subscription:
 *     get:
 *       tags: [Account]
 *       summary: Get current subscription
 *       responses:
 *         200:
 *           description: Subscription returned
 *     put:
 *       tags: [Account]
 *       summary: Update subscription
 *       responses:
 *         200:
 *           description: Subscription updated
 *   /api/account:
 *     delete:
 *       tags: [Account]
 *       summary: Delete account
 *       responses:
 *         200:
 *           description: Account deleted
 */

/**
 * @swagger
 * paths:
 *   /api/history/user:
 *     get:
 *       tags: [History]
 *       summary: Get history for current user
 *       responses:
 *         200:
 *           description: History returned
 *   /api/history/user/export:
 *     get:
 *       tags: [History]
 *       summary: Export history for current user
 *       responses:
 *         200:
 *           description: Export generated
 *   /api/history/salon/{salon_id}:
 *     get:
 *       tags: [History]
 *       summary: Get visit history for salon
 *       parameters:
 *         - in: path
 *           name: salon_id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: History returned
 */

module.exports = {};
