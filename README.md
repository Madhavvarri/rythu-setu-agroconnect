# ManaRythuSetu

RythuSetu — Complete AI App Development Master Prompt

Build a production-ready, modern agricultural services platform called RythuSetu.

1. App Vision

RythuSetu is an agriculture-focused digital platform that connects farmers with agricultural labourers and provides farmers with additional farming-related services in one application.

The platform will have four major modules:

Farmer ↔ Labour Connect

Agricultural Products Marketplace

Organic Seeds & Natural Fertilizer Store

Crop Insurance Support & Comparison

The platform must be designed primarily for Indian farmers and should have a very simple, mobile-friendly interface that can be used by users with limited technical knowledge.

The app should support Telugu and English from the beginning.

Use ₹ INR as the default currency.

2. Important Insurance Business Rule

RythuSetu is NOT an insurance company and must NOT represent itself as an insurance provider.

RythuSetu should only provide:

Crop information

Insurance option discovery

Insurance comparison/support

Guidance to suitable insurance options

Links/contact information for authorized insurance providers/platforms

Policy-related support requests

Claim-related assistance/support tracking

The actual insurance policy must be purchased from the respective authorized insurance provider/platform.

Do NOT create functionality that falsely makes RythuSetu the insurer.

Display an appropriate disclaimer wherever insurance options are shown.

3. User Roles

Create these primary roles:

A. Farmer

Farmers can:

Register/login

Create farmer profile

Add farm details

Find agricultural labour

Post labour requirements

Contact labourers

View labour applications

Hire labour

Rate/review labourers

Browse vegetables, eggs and chicken

Purchase products

Browse organic seeds

Purchase natural fertilizers

Browse crop insurance options

Request insurance support

Track support requests

Receive notifications

B. Labourer

Labourers can:

Register/login

Create labour profile

Add skills

Select work categories

Set preferred working locations

Set availability

Browse nearby jobs

Apply for jobs

Accept work

Contact farmers after appropriate matching/acceptance

Track jobs

Mark work as completed

Receive ratings/reviews

C. Seller / Organisation

Sellers can:

Register

Create business/organisation profile

Add products

Manage stock

Set prices

Receive orders

Update order status

View sales

Manage delivery information

Products can include:

Vegetables

Eggs

Chicken

Organic seeds

Cow dung manure

Vermicompost

Natural fertilizers

Bio-fertilizers

Other approved organic farming inputs

D. Admin

Admin has complete control over the platform.

Admin can:

Manage users

Verify users

Manage farmers

Manage labourers

Manage sellers

Manage products

Manage categories

Manage labour jobs

Manage applications

Manage orders

Manage payments

Manage insurance support requests

Manage complaints

Manage reviews

Manage notifications

Manage banners

Manage content

Manage locations

Block/unblock users

View analytics

View reports

Manage platform settings

4. Authentication

Create a secure authentication system.

Preferred login:

Mobile number

OTP verification

Optional:

Email

Password

Google login

During registration ask:

Full name

Mobile number

User type

Village/town

District

State

Preferred language

For labourers additionally ask:

Skills

Experience

Work type

Preferred wage

Availability

Preferred working radius

For farmers additionally ask:

Farm location

Farm size

Crops grown

Farming type

5. Home Screen

Create a clean agriculture-themed dashboard.

Header:

RythuSetu logo

Location

Notifications

Profile

Main greeting:

"Namaskaram, Rythu Garu 👋"

Show four major service cards:

Find Labour

"Find trusted agricultural workers near you"

Farm Market

"Vegetables • Eggs • Chicken"

Organic Store

"Seeds • Natural Fertilizers"

Crop Insurance Support

"Find and understand suitable crop insurance options"

Also show:

Nearby labour jobs

Popular products

Organic farming products

Seasonal farming information

Important announcements

Featured sellers

Use large buttons and icons suitable for first-time smartphone users.

6. Farmer Module — Labour Connect

Create a dedicated Labour section.

Farmer: Post Labour Requirement

Fields:

Work title

Work category

Crop

Number of workers required

Work date

Expected duration

Wage

Wage type: per day / per hour / per task

Village/location

Description

Accommodation available: Yes/No

Food available: Yes/No

Contact preference

Example:

"Need 8 workers for chilli harvesting"

After posting:

Job status:

Open

Applications received

Workers selected

In progress

Completed

Cancelled

7. Labour Search

Farmers can search/filter by:

Location

Distance

Skill

Crop experience

Availability

Wage expectation

Rating

Experience

Labour profile should show:

Name

Profile photo

Skills

Experience

Location

Availability

Expected wage

Rating

Completed jobs

Verification status

Provide:

"Contact" / "Request Worker" button.

Protect personal contact information where appropriate and only reveal contact details according to platform rules and user consent.

8. Labourer Module

Labourers see:

"Jobs Near You"

Job card:

Work title

Farmer/location

Crop

Date

Duration

Wage

Number of workers

Distance

Job status

Buttons:

View Details

Apply

Labourer dashboard:

Available Jobs

Applied Jobs

Accepted Jobs

Current Work

Completed Work

Earnings/Payment history

9. Matching System

Create a smart matching system.

When a farmer posts a requirement, calculate suitable labourers using:

Distance

Skill

Crop experience

Availability

Rating

Previous work history

Display:

"Best Matches"

with a match percentage such as:

95% Match

Do not claim that the percentage is a guaranteed suitability score. It is only a platform recommendation.

10. Farm Products Marketplace

Create a marketplace for:

Vegetables

Examples:

Tomato

Brinjal

Chilli

Onion

Potato

Lady Finger

Leafy vegetables

Eggs

Country eggs

Farm eggs

Other approved egg products

Chicken

Broiler chicken

Country chicken

Other legally permitted products

Product card:

Product image

Product name

Seller

Price

Unit

Available quantity

Location

Rating

Buttons:

Add to Cart

Buy Now

11. Organic Farming Store

Create a separate "Organic Store" section.

Categories:

Organic Seeds

Vegetable seeds

Fruit seeds

Grain seeds

Other approved seeds

Natural Fertilizers

Cow dung manure

Vermicompost

Compost

Neem-based products

Bio-fertilizers

Natural soil conditioners

Product details:

Product image

Name

Description

Benefits

Usage instructions

Quantity

Price

Seller

Stock

Reviews

Important:

Do not make unsupported medical, agricultural or guaranteed-yield claims.

Allow admin to approve product descriptions before publishing.

12. Cart & Orders

Create a complete cart system.

Cart features:

Product quantity

Price

Subtotal

Delivery fee

Discount

Final total

Checkout:

Delivery address

Phone number

Order summary

Payment method

Terms acceptance

Payment methods can include:

UPI

Credit/Debit Card

Net Banking

Cash on Delivery where applicable

Use a proper payment gateway integration rather than storing card details inside the application.

Order statuses:

Pending

Confirmed

Processing

Packed

Shipped

Out for Delivery

Delivered

Cancelled

Refunded

13. Seller Dashboard

Create a separate seller dashboard.

Dashboard metrics:

Total orders

Pending orders

Completed orders

Sales

Products

Low stock

Reviews

Seller can:

Add product

Edit product

Delete product

Update stock

Change price

Upload images

Manage orders

Update delivery status

View earnings

Admin must have the ability to approve/reject products before they become publicly visible.

14. Crop Insurance Support

Create a section named:

"Crop Insurance Support"

Do NOT call RythuSetu an insurance company.

Start with:

"Select your crop to explore available insurance options and support."

Ask:

State

District

Crop

Season

Farm area

Farming type

Optional additional details

Then show available insurance information/options from authorized providers or supported external platforms.

Insurance comparison cards can show:

Provider

Crop covered

Area/region

Coverage details

Premium information when available

Important conditions

Policy period

Official provider link/contact

RythuSetu support availability

Buttons:

"View Details"

"Visit Provider"

"Request Support"

"Contact Support"

Always clearly state:

"RythuSetu is an independent support platform and does not itself provide or underwrite insurance policies. Policy terms, eligibility, premiums and claims are determined by the respective authorized insurance provider."

15. Insurance Support Ticket System

Farmers can create support requests.

Ticket categories:

Policy information

Purchase assistance

Policy document issue

Premium issue

Claim assistance

Claim status

Crop loss information

General insurance support

Ticket fields:

Ticket ID

Farmer

Crop

Provider

Policy number if applicable

Issue category

Description

Attachments

Date

Status

Statuses:

Open

Under Review

Waiting for Farmer

Waiting for Provider

Resolved

Closed

Admin/support team can respond to tickets.

16. Location System

Use location-based functionality for:

Labour matching

Nearby jobs

Nearby farmers

Seller locations

Delivery areas

Allow users to manually select:

State

District

Mandal

Village

Do not force users to provide precise GPS location.

If GPS is used, request permission clearly and explain why it is needed.

17. Notifications

Create push notifications for:

Farmer

Labour application received

Worker accepted

Job reminder

Job completed

Order confirmed

Order shipped

Order delivered

Insurance support update

Important farming alerts

Labourer

New matching job

Application accepted

Job reminder

Work completed

New local opportunities

Seller

New order

Payment received

Low stock

Product approval/rejection

18. Ratings & Reviews

After completed labour work:

Farmer can rate labourer.

Labourer can rate farmer.

After completed product order:

Customer can rate seller/product.

Rating:

1–5 stars

Optional written review

Admin can moderate reviews.

Prevent users from repeatedly manipulating ratings.

19. Complaint & Report System

Allow users to report:

Fake profiles

Fraud

Wrong product

Bad behaviour

Fake job

Payment issue

Misleading information

Other complaints

Admin can:

Review complaint

Contact involved users

Resolve

Suspend user

Close complaint

20. Admin Dashboard

Create a professional web-based admin dashboard.

Dashboard cards:

Total Farmers

Total Labourers

Total Sellers

Active Jobs

Completed Jobs

Total Orders

Revenue

Support Tickets

Pending Approvals

Reported Users

Charts:

User growth

Jobs posted

Jobs completed

Orders

Sales

Product categories

Support tickets

Admin menu:

Dashboard

Farmers

Labourers

Sellers

Products

Categories

Labour Jobs

Applications

Orders

Payments

Insurance Support

Complaints

Reviews

Notifications

Banners

Content

Reports

Settings

21. Database Structure

Use a scalable relational database.

Suggested tables:

users

id

name

mobile

email

role

language

profile_image

state

district

mandal

village

latitude

longitude

verification_status

status

created_at

farmer_profiles

id

user_id

farm_size

crops

farming_type

farm_location

labour_profiles

id

user_id

skills

experience

preferred_wage

availability

preferred_radius

rating

seller_profiles

id

user_id

business_name

business_type

verification_status

labour_jobs

id

farmer_id

title

crop

category

workers_required

date

duration

wage

wage_type

location

description

status

created_at

labour_applications

id

job_id

labourer_id

status

applied_at

products

id

seller_id

category_id

name

description

price

unit

stock

images

approval_status

status

created_at

categories

id

name

type

carts

id

user_id

cart_items

id

cart_id

product_id

quantity

orders

id

user_id

total

delivery_fee

payment_status

order_status

address

created_at

order_items

id

order_id

product_id

seller_id

quantity

price

insurance_options

id

provider_name

crop

state

season

coverage

provider_url

status

insurance_support_tickets

id

user_id

provider

crop

policy_number

category

description

attachments

status

created_at

reviews

id

reviewer_id

target_user_id

product_id

job_id

rating

comment

complaints

id

reporter_id

target_type

target_id

category

description

status

notifications

id

user_id

title

message

type

read_status

created_at

22. UI/UX Design

Design should feel:

Agricultural

Trustworthy

Clean

Modern

Simple

Local/Indian

Easy for older farmers

Use an agriculture-inspired visual identity.

Primary visual direction:

Green

Natural/earth tones

White backgrounds

Simple cards

Large buttons

Clear icons

High readability

Do not overcrowd the screen.

Use Telugu labels where appropriate and allow language switching.

Example navigation:

Home | Jobs | Market | Organic | Insurance | Profile

Use bottom navigation on mobile.

23. Accessibility

Support:

Large readable text

High contrast

Large tap targets

Simple language

Telugu localization

Error messages that are easy to understand

Loading indicators

Empty states

Offline-friendly design where practical

24. Security

Implement:

Secure authentication

OTP verification

Role-based authorization

Admin access control

Input validation

API authentication

Secure password handling if passwords are supported

Payment gateway security

File upload validation

Rate limiting

Protection against unauthorized access

Audit logs for admin actions

Never store raw card numbers, CVV or sensitive payment credentials.

25. Privacy

Collect only information necessary for the service.

Provide:

Privacy Policy

Terms & Conditions

Consent screens

Account deletion

Data handling information

Protect users' phone numbers and personal information.

Do not publicly expose exact personal information unnecessarily.

26. Error Handling

Create friendly error messages.

Examples:

"No workers found near your selected location."

"No jobs available right now."

"This product is currently out of stock."

"Something went wrong. Please try again."

"Your support request has been submitted successfully."

Do not show technical errors to normal users.

27. Search

Global search should support:

Labour

Jobs

Products

Organic seeds

Fertilizers

Sellers

Filters should be available for each category.

28. Future Expansion Architecture

Build the application so these features can be added later without rebuilding the entire system:

Farm equipment rental

Tractor rental

Drone/agriculture services

Weather information

Crop disease identification

Agricultural expert consultation

Government scheme information

Fertilizer recommendation

Farm produce direct selling

Logistics

Farmer groups/community

AI farming assistant

Do not implement these future modules now unless specifically requested.

Keep the backend modular and scalable.

29. Recommended Technology Architecture

If the development environment allows technology selection, use:

Frontend:

React Native or Flutter for Android/iOS mobile app

Admin:

React / Next.js web dashboard

Backend:

Node.js / NestJS or equivalent scalable backend

Database:

PostgreSQL

Storage:

Secure cloud object storage for product/profile images

Authentication:

OTP-based authentication

Maps:

Google Maps or another reliable map provider

Notifications:

Firebase Cloud Messaging

Payments:

A trusted Indian payment gateway such as Razorpay or equivalent, subject to availability and compliance

All third-party integrations must use environment variables for API keys.

Never hard-code secret keys.

30. Development Requirements

Build the application in a modular architecture.

Use:

Clean code

Reusable components

Type-safe APIs where possible

Proper API validation

Database migrations

Error handling

Loading states

Empty states

Form validation

Responsive layouts

Secure authentication

Role-based access control

Do not create fake functionality that only looks functional.

If an external API is not configured, create a clearly marked mock/service layer so it can be replaced with the real API later.

31. Demo Data

Create realistic demo data for development.

Example farmers:

Ramesh

Srinivas

Lakshmi

Example labourers:

Ravi

Suresh

Kumar

Example products:

Tomato

Green Chilli

Country Eggs

Country Chicken

Organic Tomato Seeds

Organic Chilli Seeds

Cow Dung Manure

Vermicompost

Use clearly marked demo data and do not present fake insurance providers as real providers.

32. Important Legal/Trust Requirements

Do not make misleading claims such as:

"Guaranteed crop insurance"

"Guaranteed crop yield"

"Guaranteed labour"

"Guaranteed income"

"Guaranteed insurance claim"

Use transparent language.

Insurance information must clearly identify the actual provider.

Marketplace products must follow applicable food, agricultural-input, animal-product and e-commerce requirements.

Add appropriate disclaimers and compliance placeholders wherever required.

33. Branding

App Name:

RythuSetu

Telugu:

రైతుసేతు

Tagline:

"రైతు అవసరానికి… రైతుసేతు అండగా."

English tagline:

"Connecting Farmers to Everything They Need."

Brand concept:

A bridge connecting farmers with:

Labour

Markets

Organic farming inputs

Insurance support

Future agricultural services

34. Final User Journey

A new farmer should be able to:

Install RythuSetu

Select Telugu/English

Register using mobile OTP

Select "Farmer"

Create farmer profile

Open Home

Select "Find Labour"

Post labour requirement

Receive applications

Select a suitable labourer

Complete the work

Give rating

The same farmer can then:

Open Market

Purchase vegetables/eggs/chicken

Then:

Open Organic Store

Purchase organic seeds/natural fertilizer

Then:

Open Crop Insurance Support

Select crop

View suitable insurance information/options

Visit authorized provider

Purchase policy directly from the provider

Return to RythuSetu for support if needed

This should make RythuSetu a complete digital agricultural support ecosystem.

35. Build Priority

Build in this order:

Phase 1

Authentication + user roles + profiles

Phase 2

Farmer ↔ Labour system

Phase 3

Marketplace + cart + orders

Phase 4

Organic Store

Phase 5

Insurance support module

Phase 6

Notifications + ratings + complaints

Phase 7

Admin dashboard + analytics

Phase 8

Security testing + performance optimization + deployment preparation

FINAL INSTRUCTION TO THE AI DEVELOPMENT TOOL

Do not merely create static screens.

Create a functional, scalable application architecture where:

Frontend

Backend

Database

Authentication

APIs

Admin panel

User roles

Marketplace

Labour matching

Orders

Insurance support

Notifications

Reviews

Complaints

are logically connected.

Start by generating the complete project structure and database schema, then implement the authentication and role-based flows, followed by each module in the development priority order.

Keep the UI simple enough for farmers with limited smartphone experience while maintaining a professional modern design.

The application name must be RythuSetu / రైతుసేతు throughout the project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/74de8350-3652-4034-8dc9-876b9259d8b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
