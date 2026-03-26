# API Endpoint Catalog

Generated from FastAPI OpenAPI schema on `2026-03-26 13:03:39Z`.

## Summary

- Tags: `16`
- Paths: `151`
- Operations: `188`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Swagger Testing Flow

1. Start the backend.
2. Open `/docs`.
3. Click `Authorize` in Swagger UI.
4. Enter your email or username in the `username` field and your password in the `password` field.
5. Swagger will call `POST /api/v1/auth/token` automatically and store the bearer token.
6. Expand endpoints by tag and test them directly from Swagger.

Manual alternative: call `POST /api/v1/auth/login`, copy the `access_token`, and paste it into `Authorize`.

## Tag Counts

| Tag | Operations |
| --- | ---: |
| AI | 7 |
| Authentication | 13 |
| Customer | 11 |
| Finance | 1 |
| Geocoding | 2 |
| Health | 1 |
| Inventory | 14 |
| Labourers | 9 |
| Live Tracking | 2 |
| Logistics Manager | 33 |
| Orders | 19 |
| Rates | 2 |
| Users | 7 |
| Vendor | 26 |
| Warehouse Operations | 30 |
| Warehouses | 11 |

## AI

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/ai/chat` | Send a message to the AI chatbot | Bearer token | `application/json -> ChatRequest` | `200 application/json -> ChatResponse` |
| GET | `/api/v1/ai/conversations/{session_id}` | Get conversation history | Bearer token | `None` | `200 application/json -> ConversationHistory` |
| POST | `/api/v1/ai/escalate/{conversation_id}` | Escalate conversation to human agent | Bearer token | `application/json -> EscalateRequest` | `201 application/json -> EscalationResponse` |
| GET | `/api/v1/ai/escalations` | List escalations | Bearer token | `None` | `200 application/json -> EscalationListResponse` |
| PUT | `/api/v1/ai/escalations/{escalation_id}/resolve` | Resolve an escalation | Bearer token | `None` | `200 application/json -> EscalationResponse` |
| POST | `/api/v1/ai/estimate-image` | Analyze a room photo for moving estimate | No | `multipart/form-data -> Body_estimate_image_api_v1_ai_estimate_image_post` | `200 application/json -> None` |
| GET | `/api/v1/ai/sessions` | List chat sessions | Bearer token | `None` | `200 application/json -> SessionListResponse` |

## Authentication

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/change-password` | Change password | Bearer token | `application/json -> ChangePasswordRequest` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/auth/forgot-password` | Request password reset email | No | `application/json -> ForgotPasswordRequest` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/auth/google-login` | Login or Register with Google | No | `application/json -> GoogleLoginRequest` | `200 application/json -> LoginResponse` |
| POST | `/api/v1/auth/login` | Issue JWT tokens with user profile | No | `application/json -> UserLogin` | `200 application/json -> LoginResponse` |
| POST | `/api/v1/auth/logout` | Invalidate access token via Redis blacklist | No | `None` | `200 application/json -> MessageResponse` |
| GET | `/api/v1/auth/me` | Get current user profile | Bearer token | `None` | `200 application/json -> UserProfile` |
| PUT | `/api/v1/auth/me` | Update current user profile | Bearer token | `application/json -> UserProfileUpdate` | `200 application/json -> UserProfile` |
| POST | `/api/v1/auth/refresh` | Refresh access token | No | `application/json -> RefreshTokenRequest` | `200 application/json -> TokenResponse` |
| POST | `/api/v1/auth/register` | Self-service sign-up (Individual & Vendor only) | No | `application/json -> UserRegister` | `201 application/json -> TokenResponse` |
| POST | `/api/v1/auth/reset-password` | Confirm password reset with token | No | `application/json -> ResetPasswordRequest` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/auth/send-otp` | Send email verification OTP for signup | No | `application/json -> SendOTPRequest` | `200 application/json -> SignupOtpSendResponse` |
| POST | `/api/v1/auth/token` | Issue OAuth2 bearer token for Swagger UI | No | `application/x-www-form-urlencoded -> Body_token_login_api_v1_auth_token_post` | `200 application/json -> TokenResponse` |
| POST | `/api/v1/auth/verify-otp` | Verify email OTP before completing signup | No | `application/json -> VerifyOTPRequest` | `200 application/json -> OTPVerifiedResponse` |

## Customer

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/customer/damage-reports` | Get Damage Reports | Bearer token | `None` | `200 application/json -> CustomerDamageReportsResponse` |
| POST | `/api/v1/customer/damage-reports` | Create Damage Report | Bearer token | `application/json -> CustomerDamageReportCreate` | `200 application/json -> CustomerDamageReport` |
| GET | `/api/v1/customer/dashboard` | Get Dashboard | Bearer token | `None` | `200 application/json -> None` |
| GET | `/api/v1/customer/payments` | Get Payments | Bearer token | `None` | `200 application/json -> CustomerPaymentsSummary` |
| GET | `/api/v1/customer/profile` | Get Profile | Bearer token | `None` | `200 application/json -> CustomerProfileResponse` |
| GET | `/api/v1/customer/quotes` | Get Quotes | Bearer token | `None` | `200 application/json -> CustomerQuotesResponse` |
| POST | `/api/v1/customer/quotes/{quote_id}/convert` | Convert Quote | Bearer token | `None` | `200 application/json -> None` |
| GET | `/api/v1/customer/settings` | Get Settings | Bearer token | `None` | `200 application/json -> CustomerSettingsResponse` |
| PUT | `/api/v1/customer/settings` | Update Settings | Bearer token | `application/json -> CustomerSettings` | `200 application/json -> CustomerSettingsResponse` |
| GET | `/api/v1/customer/tracking` | Get Tracking | Bearer token | `None` | `200 application/json -> CustomerTrackingResponse` |
| GET | `/api/v1/customer/wallet` | Get Wallet | Bearer token | `None` | `200 application/json -> WalletSummary` |

## Finance

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/finance/summary` | Get Finance Summary | Bearer token | `None` | `200 application/json -> Response Get Finance Summary Api V1 Finance Summary Get` |

## Geocoding

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/geocoding/reverse` | Reverse Geocode | No | `None` | `200 application/json -> Response Reverse Geocode Api V1 Geocoding Reverse Get` |
| GET | `/api/v1/geocoding/search` | Search Addresses | No | `None` | `200 application/json -> array[object]` |

## Health

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/health` | Health Check | No | `None` | `200 application/json -> None` |

## Inventory

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/inventory` | List Inventory | Bearer token | `None` | `200 application/json -> InventoryListResponse` |
| POST | `/api/v1/inventory` | Create Inventory Item | Bearer token | `application/json -> InventoryCreate` | `201 application/json -> InventoryResponse` |
| GET | `/api/v1/inventory/categories` | List Inventory Categories | Bearer token | `None` | `200 application/json -> array[string]` |
| GET | `/api/v1/inventory/low-stock` | Low Stock | Bearer token | `None` | `200 application/json -> array[InventoryResponse]` |
| GET | `/api/v1/inventory/movements` | List Inventory Movements | Bearer token | `None` | `200 application/json -> array[InventoryMovementResponse]` |
| POST | `/api/v1/inventory/movements` | Create Inventory Movement | Bearer token | `application/json -> InventoryMovementCreate` | `201 application/json -> InventoryMovementResponse` |
| POST | `/api/v1/inventory/pick-list/{order_id}` | Pick List | Bearer token | `None` | `200 application/json -> PickingListResponse` |
| GET | `/api/v1/inventory/restock-requests` | List Restock Requests | Bearer token | `None` | `200 application/json -> RestockRequestListResponse` |
| POST | `/api/v1/inventory/restock-requests` | Create Restock Request | Bearer token | `application/json -> RestockRequestCreate` | `201 application/json -> RestockRequestResponse` |
| POST | `/api/v1/inventory/restock-requests/{request_id}/escalate` | Escalate Restock Request | Bearer token | `None` | `200 application/json -> RestockRequestResponse` |
| PUT | `/api/v1/inventory/restock-requests/{request_id}/status` | Update Restock Request Status | Bearer token | `application/json -> RestockRequestStatusUpdate` | `200 application/json -> RestockRequestResponse` |
| DELETE | `/api/v1/inventory/{item_id}` | Delete Inventory Item | Bearer token | `None` | `200 application/json -> MessageResponse` |
| GET | `/api/v1/inventory/{item_id}` | Get Inventory Item | Bearer token | `None` | `200 application/json -> InventoryResponse` |
| PUT | `/api/v1/inventory/{item_id}` | Update Inventory Item | Bearer token | `application/json -> InventoryUpdate` | `200 application/json -> InventoryResponse` |

## Labourers

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/labourers` | List Labourers | Bearer token | `None` | `200 application/json -> LabourerListResponse` |
| POST | `/api/v1/labourers` | Create Labourer | Bearer token | `application/json -> LabourerCreate` | `201 application/json -> LabourerResponse` |
| GET | `/api/v1/labourers/availability` | Availability | Bearer token | `None` | `200 application/json -> LabourAvailabilityResponse` |
| DELETE | `/api/v1/labourers/{labourer_id}` | Delete Labourer | Bearer token | `None` | `204` |
| GET | `/api/v1/labourers/{labourer_id}` | Get Labourer | Bearer token | `None` | `200 application/json -> LabourerResponse` |
| PUT | `/api/v1/labourers/{labourer_id}` | Update Labourer | Bearer token | `application/json -> LabourerUpdate` | `200 application/json -> LabourerResponse` |
| POST | `/api/v1/labourers/{labourer_id}/assign/{order_id}` | Assign Labourer | Bearer token | `None` | `200 application/json -> AssignLabourResponse` |
| POST | `/api/v1/labourers/{labourer_id}/check-in` | Check In | Bearer token | `None` | `200 application/json -> LabourAttendanceResponse` |
| POST | `/api/v1/labourers/{labourer_id}/check-out` | Check Out | Bearer token | `None` | `200 application/json -> LabourAttendanceResponse` |

## Live Tracking

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/tracking/drivers` | Get Active Driver Locations | Bearer token | `None` | `200 application/json -> array[DriverLocationItem]` |
| GET | `/api/v1/tracking/orders/{order_id}/driver` | Get Order Driver Location | Bearer token | `None` | `200 application/json -> DriverLocationItem / null` |

## Logistics Manager

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/logistics/ai/query` | Ai Query | Bearer token | `application/json -> LogisticsAiQueryRequest` | `200 application/json -> LogisticsAiQueryResponse` |
| POST | `/api/v1/logistics/alerts` | Create Alert | Bearer token | `application/json -> Payload` | `200 application/json -> Response Create Alert Api V1 Logistics Alerts Post` |
| POST | `/api/v1/logistics/alerts/{alert_id}/resolve` | Resolve Alert | Bearer token | `None` | `200 application/json -> MessageResponse` |
| GET | `/api/v1/logistics/bootstrap` | Bootstrap | Bearer token | `None` | `200 application/json -> LogisticsBootstrapResponse` |
| POST | `/api/v1/logistics/capital-investment` | Create Capital Investment | Bearer token | `application/json -> CapitalInvestmentCreate` | `201 application/json -> Response Create Capital Investment Api V1 Logistics Capital Investment Post` |
| POST | `/api/v1/logistics/chats/{thread_id}/messages` | Add Chat Message | Bearer token | `application/json -> LogisticsChatMessageCreate` | `200 application/json -> LogisticsChatThreadItem` |
| POST | `/api/v1/logistics/documents` | Create Document | Bearer token | `application/json -> LogisticsDocumentCreate` | `201 application/json -> LogisticsDocumentItem` |
| PUT | `/api/v1/logistics/documents/{doc_id}/status` | Update Document Status | Bearer token | `application/json -> LogisticsDocumentUpdateStatus` | `200 application/json -> LogisticsDocumentItem` |
| GET | `/api/v1/logistics/drivers` | List Drivers | Bearer token | `None` | `200 application/json -> array[LogisticsDriverItem]` |
| POST | `/api/v1/logistics/drivers` | Create Driver | Bearer token | `application/json -> LogisticsDriverCreate` | `201 application/json -> LogisticsDriverItem` |
| POST | `/api/v1/logistics/drivers/me/bind-vehicle` | Bind Driver Vehicle | Bearer token | `application/json -> DriverVehicleBindRequest` | `200 application/json -> LogisticsVehicleItem` |
| GET | `/api/v1/logistics/drivers/me/crew` | Get Driver Crew | Bearer token | `None` | `200 application/json -> array[DriverCrewMemberItem]` |
| POST | `/api/v1/logistics/drivers/me/crew/{labourer_id}/check-in` | Check In Driver Crew Member | Bearer token | `None` | `200 application/json -> DriverCrewMemberItem` |
| GET | `/api/v1/logistics/drivers/me/dashboard` | Get Driver Dashboard | Bearer token | `None` | `200 application/json -> DriverDashboardContext` |
| GET | `/api/v1/logistics/drivers/me/hos` | Get Driver Hos | Bearer token | `None` | `200 application/json -> DriverHosSummary` |
| POST | `/api/v1/logistics/drivers/me/location` | Update Driver Location | Bearer token | `application/json -> LocationUpdateParams` | `200 application/json -> Response Update Driver Location Api V1 Logistics Drivers Me Location Post` |
| GET | `/api/v1/logistics/drivers/me/shift` | Get Driver Shift | Bearer token | `None` | `200 application/json -> DriverShiftSummary` |
| POST | `/api/v1/logistics/drivers/me/shift/end` | End Shift | Bearer token | `None` | `200 application/json -> Response End Shift Api V1 Logistics Drivers Me Shift End Post` |
| POST | `/api/v1/logistics/drivers/me/shift/start` | Start Shift | Bearer token | `None` | `200 application/json -> Response Start Shift Api V1 Logistics Drivers Me Shift Start Post` |
| GET | `/api/v1/logistics/drivers/me/telemetry` | Get Driver Telemetry | Bearer token | `None` | `200 application/json -> DriverTelemetryResponse` |
| PUT | `/api/v1/logistics/drivers/{driver_id}` | Update Driver | Bearer token | `application/json -> LogisticsDriverUpdate` | `200 application/json -> LogisticsDriverItem` |
| DELETE | `/api/v1/logistics/notifications` | Clear Notifications | Bearer token | `None` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/logistics/notifications/mark-all-read` | Mark All Notifications Read | Bearer token | `None` | `200 application/json -> MessageResponse` |
| PUT | `/api/v1/logistics/notifications/{notification_id}` | Update Notification | Bearer token | `application/json -> LogisticsNotificationUpdate` | `200 application/json -> LogisticsNotificationItem` |
| PUT | `/api/v1/logistics/returns/{case_id}` | Update Return Case | Bearer token | `application/json -> LogisticsReturnCaseUpdate` | `200 application/json -> LogisticsReturnCaseItem` |
| PUT | `/api/v1/logistics/tasks/{task_id}` | Update Task | Bearer token | `application/json -> LogisticsTaskUpdate` | `200 application/json -> LogisticsTaskItem` |
| POST | `/api/v1/logistics/transactions` | Create Transaction | Bearer token | `application/json -> LogisticsTransactionCreate` | `201 application/json -> LogisticsTransactionItem` |
| GET | `/api/v1/logistics/vehicles` | List Vehicles | Bearer token | `None` | `200 application/json -> array[LogisticsVehicleItem]` |
| POST | `/api/v1/logistics/vehicles` | Create Vehicle | Bearer token | `application/json -> LogisticsVehicleCreate` | `201 application/json -> LogisticsVehicleItem` |
| PUT | `/api/v1/logistics/vehicles/{vehicle_id}` | Update Vehicle | Bearer token | `application/json -> LogisticsVehicleUpdate` | `200 application/json -> LogisticsVehicleItem` |
| POST | `/api/v1/logistics/zones` | Create Zone | Bearer token | `application/json -> LogisticsZoneCreate` | `201 application/json -> LogisticsZoneItem` |
| DELETE | `/api/v1/logistics/zones/{zone_id}` | Delete Zone | Bearer token | `None` | `200 application/json -> MessageResponse` |
| PUT | `/api/v1/logistics/zones/{zone_id}` | Update Zone | Bearer token | `application/json -> LogisticsZoneUpdate` | `200 application/json -> LogisticsZoneItem` |

## Orders

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/orders` | List Orders | Bearer token | `None` | `200 application/json -> OrderListResponse` |
| POST | `/api/v1/orders` | Create Order | Bearer token | `application/json -> OrderCreate` | `201 application/json -> OrderResponse` |
| POST | `/api/v1/orders/batch-assign` | Batch Assign Orders | Bearer token | `application/json -> BatchConfirmRequest` | `200 application/json -> None` |
| POST | `/api/v1/orders/cluster` | Cluster Orders | Bearer token | `None` | `200 application/json -> None` |
| POST | `/api/v1/orders/optimize-routes` | Optimize Routes | Bearer token | `None` | `200 application/json -> None` |
| GET | `/api/v1/orders/track/{tracking_code}` | Track Order | No | `None` | `200 application/json -> None` |
| GET | `/api/v1/orders/{order_id}` | Get Order | Bearer token | `None` | `200 application/json -> OrderResponse` |
| PUT | `/api/v1/orders/{order_id}` | Update Order | Bearer token | `application/json -> OrderUpdate` | `200 application/json -> OrderResponse` |
| POST | `/api/v1/orders/{order_id}/assign` | Assign Order | Bearer token | `application/json -> OrderAssignRequest` | `200 application/json -> OrderResponse` |
| POST | `/api/v1/orders/{order_id}/cancel` | Cancel Order | Bearer token | `application/json -> CancelOrderRequest` | `200 application/json -> OrderResponse` |
| POST | `/api/v1/orders/{order_id}/confirm` | Confirm Order | Bearer token | `None` | `200 application/json -> OrderResponse` |
| POST | `/api/v1/orders/{order_id}/delivery-otp/send` | Send Delivery Otp | Bearer token | `application/json -> DeliveryOtpSendRequest` | `200 application/json -> DeliveryOtpSendResponse` |
| GET | `/api/v1/orders/{order_id}/items` | Get Order Items | Bearer token | `None` | `200 application/json -> array[OrderItemResponse]` |
| POST | `/api/v1/orders/{order_id}/items` | Upsert Items | Bearer token | `application/json -> array[OrderItemUpsert]` | `200 application/json -> array[OrderItemResponse]` |
| POST | `/api/v1/orders/{order_id}/pay` | Pay Order | Bearer token | `application/json -> PayOrderRequest` | `200 application/json -> None` |
| GET | `/api/v1/orders/{order_id}/proof-of-delivery` | Get Proof Of Delivery Html | Bearer token | `None` | `200 text/html -> string` |
| POST | `/api/v1/orders/{order_id}/proof-of-delivery` | Upload Proof Of Delivery | Bearer token | `application/json -> PODRequest` | `200 application/json -> OrderResponse` |
| POST | `/api/v1/orders/{order_id}/transition` | Transition Order | Bearer token | `application/json -> Data` | `200 application/json -> OrderResponse` |
| POST | `/api/v1/orders/{order_id}/wallet-pay` | Pay Order With Wallet | Bearer token | `application/json -> WalletPaymentRequest` | `200 application/json -> WalletPaymentResponse` |

## Rates

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/rates` | Get current rate configuration | No | `None` | `200 application/json -> Response Get Rates Api V1 Rates Get` |
| PUT | `/api/v1/rates` | Update rate configuration (LOGISTIC_MANAGER only) | Bearer token | `application/json -> Payload` | `200 application/json -> Response Update Rates Api V1 Rates Put` |

## Users

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/users` | List Users | Bearer token | `None` | `200 application/json -> UserListResponse` |
| POST | `/api/v1/users` | Create User | Bearer token | `application/json -> UserAdminCreate` | `201 application/json -> UserAdminResponse` |
| DELETE | `/api/v1/users/{user_id}` | Soft Delete User | Bearer token | `None` | `200 application/json -> MessageResponse` |
| GET | `/api/v1/users/{user_id}` | Get User | Bearer token | `None` | `200 application/json -> UserAdminResponse` |
| PUT | `/api/v1/users/{user_id}` | Update User | Bearer token | `application/json -> UserAdminUpdate` | `200 application/json -> UserAdminResponse` |
| POST | `/api/v1/users/{user_id}/assign-role` | Assign Role | Bearer token | `application/json -> AssignRoleRequest` | `200 application/json -> UserAdminResponse` |
| POST | `/api/v1/users/{user_id}/assign-warehouse` | Assign Warehouse | Bearer token | `application/json -> AssignWarehouseRequest` | `200 application/json -> UserAdminResponse` |

## Vendor

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/vendor/api-keys` | List Api Keys | Bearer token | `None` | `200 application/json -> array[VendorApiKeyResponse]` |
| POST | `/api/v1/vendor/api-keys` | Create Api Key | Bearer token | `application/json -> VendorApiKeyCreate` | `200 application/json -> VendorApiKeyResponse` |
| POST | `/api/v1/vendor/api-keys/{key_id}/revoke` | Revoke Api Key | Bearer token | `None` | `200 application/json -> VendorApiKeyResponse` |
| GET | `/api/v1/vendor/bulk-uploads` | List Bulk Uploads | Bearer token | `None` | `200 application/json -> array[VendorBulkUploadResponse]` |
| POST | `/api/v1/vendor/bulk-uploads` | Create Bulk Upload | Bearer token | `application/json -> VendorBulkUploadCreate` | `200 application/json -> VendorBulkUploadResponse` |
| PUT | `/api/v1/vendor/bulk-uploads/{upload_id}` | Update Bulk Upload | Bearer token | `application/json -> VendorBulkUploadUpdate` | `200 application/json -> VendorBulkUploadResponse` |
| GET | `/api/v1/vendor/damage-reports` | Get Damage Reports | Bearer token | `None` | `200 application/json -> VendorDamageReportsResponse` |
| POST | `/api/v1/vendor/damage-reports` | Create Damage Report | Bearer token | `application/json -> VendorDamageReportCreate` | `200 application/json -> VendorDamageReport` |
| GET | `/api/v1/vendor/dashboard` | Get Dashboard | Bearer token | `None` | `200 application/json -> VendorDashboardResponse` |
| POST | `/api/v1/vendor/invoices/{order_id}/pay` | Pay Invoice | Bearer token | `application/json -> VendorInvoicePayRequest` | `200 application/json -> VendorInvoiceRecord` |
| GET | `/api/v1/vendor/recurring-rules` | List Recurring Rules | Bearer token | `None` | `200 application/json -> array[VendorRecurringRuleResponse]` |
| POST | `/api/v1/vendor/recurring-rules` | Create Recurring Rule | Bearer token | `application/json -> VendorRecurringRuleCreate` | `200 application/json -> VendorRecurringRuleResponse` |
| DELETE | `/api/v1/vendor/recurring-rules/{rule_id}` | Delete Recurring Rule | Bearer token | `None` | `200 application/json -> None` |
| PUT | `/api/v1/vendor/recurring-rules/{rule_id}` | Update Recurring Rule | Bearer token | `application/json -> VendorRecurringRuleCreate` | `200 application/json -> VendorRecurringRuleResponse` |
| POST | `/api/v1/vendor/recurring-rules/{rule_id}/toggle` | Toggle Recurring Rule | Bearer token | `None` | `200 application/json -> VendorRecurringRuleResponse` |
| GET | `/api/v1/vendor/settings` | Get Settings | Bearer token | `None` | `200 application/json -> VendorSettingsResponse` |
| PUT | `/api/v1/vendor/settings` | Update Settings | Bearer token | `application/json -> VendorSettings` | `200 application/json -> VendorSettingsResponse` |
| GET | `/api/v1/vendor/shipments` | Get Shipments | Bearer token | `None` | `200 application/json -> VendorShipmentsResponse` |
| GET | `/api/v1/vendor/support-tickets` | List Support Tickets | Bearer token | `None` | `200 application/json -> array[VendorSupportTicketResponse]` |
| POST | `/api/v1/vendor/support-tickets` | Create Support Ticket | Bearer token | `application/json -> VendorSupportTicketCreate` | `200 application/json -> VendorSupportTicketResponse` |
| POST | `/api/v1/vendor/support-tickets/{ticket_id}/reply` | Reply Support Ticket | Bearer token | `application/json -> VendorSupportReplyCreate` | `200 application/json -> VendorSupportTicketResponse` |
| POST | `/api/v1/vendor/support-tickets/{ticket_id}/resolve` | Resolve Support Ticket | Bearer token | `None` | `200 application/json -> VendorSupportTicketResponse` |
| GET | `/api/v1/vendor/team-members` | List Team Members | Bearer token | `None` | `200 application/json -> array[VendorTeamMemberResponse]` |
| POST | `/api/v1/vendor/team-members` | Create Team Member | Bearer token | `application/json -> VendorTeamMemberCreate` | `200 application/json -> VendorTeamMemberResponse` |
| DELETE | `/api/v1/vendor/team-members/{member_id}` | Delete Team Member | Bearer token | `None` | `200 application/json -> None` |
| GET | `/api/v1/vendor/wallet` | Get Wallet | Bearer token | `None` | `200 application/json -> WalletSummary` |

## Warehouse Operations

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/loading-docks` | List Loading Docks | Bearer token | `None` | `200 application/json -> LoadingDockListResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/loading-docks` | Create Loading Dock | Bearer token | `application/json -> LoadingDockCreate` | `201 application/json -> LoadingDockResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/loading-docks/{dock_id}/assign` | Assign Truck To Dock | Bearer token | `application/json -> AssignTruckRequest` | `200 application/json -> LoadingDockResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/loading-docks/{dock_id}/maintenance` | Set Dock Maintenance | Bearer token | `None` | `200 application/json -> LoadingDockResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/loading-docks/{dock_id}/release` | Release Dock | Bearer token | `application/json -> DockVerificationData` | `200 application/json -> LoadingDockResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/accept` | Accept Order | Bearer token | `None` | `200 application/json -> PickingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/complete-packing` | Complete Packing | Bearer token | `None` | `200 application/json -> PickingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/complete-picking` | Complete Picking | Bearer token | `None` | `200 application/json -> PickingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/pick-item` | Confirm Pick Item | Bearer token | `application/json -> ConfirmPickItemRequest` | `200 application/json -> PickedItemResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/pick-progress` | Get Pick Progress | Bearer token | `None` | `200 application/json -> PickProgressResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/quality-check` | Create Quality Check | Bearer token | `None` | `201 application/json -> QualityCheckResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/receive-inbound` | Receive Inbound | Bearer token | `None` | `200 application/json -> PickingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/revert-picking` | Revert Picking | Bearer token | `None` | `200 application/json -> PickingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/start-packing` | Start Packing | Bearer token | `application/json -> StartPackingRequest` | `200 application/json -> PickingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/orders/{order_id}/start-picking` | Start Picking | Bearer token | `application/json -> StartPickingRequest` | `200 application/json -> PickingResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/packing-stations` | List Packing Stations | Bearer token | `None` | `200 application/json -> PackingStationListResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/packing-stations` | Create Packing Station | Bearer token | `application/json -> PackingStationCreate` | `201 application/json -> PackingStationResponse` |
| PUT | `/api/v1/warehouses/{warehouse_id}/operations/packing-stations/{station_id}` | Update Packing Station | Bearer token | `application/json -> PackingStationUpdate` | `200 application/json -> PackingStationResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/performance` | Get Performance | Bearer token | `None` | `200 application/json -> PerformanceResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/quality-checks` | List Quality Checks | Bearer token | `None` | `200 application/json -> QualityCheckListResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/quality-checks/{check_id}` | Get Quality Check | Bearer token | `None` | `200 application/json -> QualityCheckResponse` |
| PUT | `/api/v1/warehouses/{warehouse_id}/operations/quality-checks/{check_id}` | Update Quality Check | Bearer token | `application/json -> QualityCheckUpdate` | `200 application/json -> QualityCheckResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/quality-checks/{check_id}/pass` | Pass Quality Check | Bearer token | `None` | `200 application/json -> QualityCheckResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/returns` | List Return Gradings | Bearer token | `None` | `200 application/json -> ReturnGradingListResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/returns` | Create Return Grading | Bearer token | `application/json -> ReturnGradingCreate` | `201 application/json -> ReturnGradingResponse` |
| PUT | `/api/v1/warehouses/{warehouse_id}/operations/returns/{grading_id}` | Update Return Grading | Bearer token | `application/json -> ReturnGradingUpdate` | `200 application/json -> ReturnGradingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/returns/{grading_id}/complete` | Complete Return Grading | Bearer token | `None` | `200 application/json -> ReturnGradingResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/returns/{grading_id}/photo` | Upload Damage Photo | Bearer token | `multipart/form-data -> Body_upload_damage_photo_api_v1_warehouses__warehouse_id__operations_returns__grading_id__photo_post` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/operations/zones/metrics` | Record Zone Metrics | Bearer token | `application/json -> ZoneMetricsCreate` | `201 application/json -> ZoneMetricsResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/operations/zones/{zone_id}/metrics` | Get Zone Metrics | Bearer token | `None` | `200 application/json -> ZoneMetricsListResponse` |

## Warehouses

| Method | Path | Feature | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/warehouses` | List Warehouses | Bearer token | `None` | `200 application/json -> WarehouseListResponse` |
| POST | `/api/v1/warehouses` | Create Warehouse | Bearer token | `application/json -> WarehouseCreate` | `201 application/json -> WarehouseResponse` |
| DELETE | `/api/v1/warehouses/{warehouse_id}` | Delete Warehouse | Bearer token | `None` | `200 application/json -> MessageResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}` | Get Warehouse | Bearer token | `None` | `200 application/json -> WarehouseResponse` |
| PUT | `/api/v1/warehouses/{warehouse_id}` | Update Warehouse | Bearer token | `application/json -> WarehouseUpdate` | `200 application/json -> WarehouseResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/dashboard` | Warehouse Dashboard | Bearer token | `None` | `200 application/json -> WarehouseDashboardResponse` |
| PUT | `/api/v1/warehouses/{warehouse_id}/floor-plan` | Update Floor Plan | Bearer token | `application/json -> FloorPlanUpdate` | `200 application/json -> WarehouseResponse` |
| GET | `/api/v1/warehouses/{warehouse_id}/kpis` | Warehouse Kpis | Bearer token | `None` | `200 application/json -> WarehouseKPIResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/orders/{order_id}/complete` | Mark Order Complete | Bearer token | `None` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/orders/{order_id}/reassign` | Reassign Order To Labor | Bearer token | `None` | `200 application/json -> MessageResponse` |
| POST | `/api/v1/warehouses/{warehouse_id}/restock` | Process Restock | Bearer token | `None` | `200 application/json -> MessageResponse` |

