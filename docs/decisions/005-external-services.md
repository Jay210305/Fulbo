# ADR 005: Twilio Verify for OTP and Cloudinary for media

## Decision

Use Twilio Verify for phone OTP delivery and Cloudinary for image storage and
delivery.

## Rationale

Twilio Verify provides OTP generation, rate limiting, and expiry without building
that logic. Cloudinary matches the frontend's existing `/upload` contract and
avoids running media storage on the API host.

## Consequences

- Backend configuration requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and
  `TWILIO_VERIFY_SERVICE_SID`.
- Backend configuration requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET`.
- Phone verification is server-enforced: booking creation and promotion to manager
  are rejected while `phoneVerified` is false.
- The upload module mediates all media so the frontend never holds Cloudinary
  credentials.
