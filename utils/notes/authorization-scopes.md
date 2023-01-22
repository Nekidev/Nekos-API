# Authorization scopes

- `api:ratelimit:disabled`: Disables rate limiting.
- `image:list`: Access to a paginated list of all images at `/api/image`
- `image:custom-expiry`: Access to custom image links expiry times (*Partially implemented*)
- `image:custom-expiry:{max_secs}`: Access to custom image links expiry times of up to `max_secs` seconds (*Partially implemented*)