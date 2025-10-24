# Services Hierarchy Documentation

## Service Categories and Dependencies

### Core Business Services

#### User Management Services
- **AdminService** (services/AdminService.ts)
  - Manages platform administration
  - Dependencies: NotificationService, AnalyticsService
  - Used by: AdminDashboard, AdminUsersTab, AdminOrdersTab

- **WorkerService** (services/WorkerService.ts)
  - Handles worker profiles and assignments
  - Dependencies: NotificationService, SkillMatrixService
  - Used by: WorkerCard, WorkerDashboard, LaborChiefDashboard

- **OnboardingService** (services/OnboardingService.ts)
  - Manages user onboarding flows
  - Dependencies: NotificationService, LocalizationService
  - Used by: OnboardingWizard, RoleBasedOnboardingWizard

#### Project Management Services
- **SiteService** (services/SiteService.ts)
  - Manages construction sites
  - Dependencies: ProgressTrackingService, SafetyService
  - Used by: MySitesTab, SiteSelector, ClientDashboard

- **ProgressTrackingService** (services/ProgressTrackingService.ts)
  - Tracks project progress and milestones
  - Dependencies: NotificationService, AnalyticsService
  - Used by: ContractorProgressTab, ProgressPanel, BIMViewer

- **BIMConceptMapService** (services/BIMConceptMapService.ts)
  - Handles BIM data and concept mapping
  - Dependencies: ProgressTrackingService, FileShareService
  - Used by: BIMViewer, ConceptCard, ConceptEditor

#### Financial Services
- **PaymentService** (services/PaymentService.ts)
  - Processes payments and transactions
  - Dependencies: EscrowService, NotificationService
  - Used by: PaymentModal, PaymentHistoryTab, InvoiceCard

- **EscrowService** (services/EscrowService.ts)
  - Manages escrow transactions
  - Dependencies: SmartContractService, NotificationService
  - Used by: PaymentService, EscrowCompletionButton

- **InvoiceService** (services/InvoiceService.ts)
  - Handles invoice generation and management
  - Dependencies: TaxService, CurrencyService
  - Used by: ClientInvoicesTab, SupplierInvoicesTab, InvoiceCard

- **TaxService** (services/TaxService.ts)
  - Manages tax calculations and compliance
  - Dependencies: CurrencyService, LocalizationService
  - Used by: InvoiceService, TaxInvoiceSystem

### Resource Management Services

#### Labor Services
- **LaborMatchingService** (services/LaborMatchingService.ts)
  - Matches labor requests with available workers
  - Dependencies: SkillMatrixService, NotificationService
  - Used by: LaborChiefDashboard, HireLaborTab, OpenLaborRequestsTab

- **LaborRequestService** (services/LaborRequestService.ts)
  - Manages labor requests and assignments
  - Dependencies: LaborMatchingService, NotificationService
  - Used by: LaborRequestForm, IncomingLaborRequestsTab

- **SkillMatrixService** (services/SkillMatrixService.ts)
  - Manages worker skills and qualifications
  - Dependencies: WorkerService
  - Used by: LaborMatchingService, SkillMatchBadge

#### Machinery Services
- **MachineryCatalogService** (services/MachineryCatalogService.ts)
  - Manages machinery catalog and specifications
  - Dependencies: SearchService, CurrencyService
  - Used by: MachineryScreen, MachineryTypeSelector, MachineryDataFeeder

- **MachineryRequestService** (services/MachineryRequestService.ts)
  - Handles machinery rental requests
  - Dependencies: BookingMatchingService, NotificationService
  - Used by: MachineryRequestForm, MachineryRequestsTab

- **BookingMatchingService** (services/BookingMatchingService.ts)
  - Matches machinery requests with available equipment
  - Dependencies: MachineryCatalogService, NotificationService
  - Used by: MachineryRenterDashboard, LiveBookingsTab

#### Material Services
- **MaterialService** (services/MaterialService.ts)
  - Manages material catalog and orders
  - Dependencies: InventoryService, CurrencyService
  - Used by: MaterialCatalog, MaterialOrdersTab, MaterialCard

- **MaterialCatalogService** (services/MaterialCatalogService.ts)
  - Handles material catalog management
  - Dependencies: MaterialService, SearchService
  - Used by: MaterialCatalogTab, MaterialCatalogView

- **InventoryService** (services/InventoryService.ts)
  - Manages inventory tracking and reordering
  - Dependencies: NotificationService, ForecastService
  - Used by: InventoryHealthTab, ReorderPanel

### Communication Services

#### Notification Services
- **NotificationService** (services/NotificationService.ts)
  - Core notification system
  - Dependencies: LocalizationService, TimezoneService
  - Used by: NotificationBell, NotificationCenter, All other services

- **AINotificationService** (services/AINotificationService.ts)
  - AI-powered smart notifications
  - Dependencies: NotificationService, AnalyticsService
  - Used by: SmartSuggestionsPanel, AIRecommendationPanel

- **ChatService** (services/ChatService.ts)
  - Handles real-time messaging
  - Dependencies: NotificationService, FileShareService
  - Used by: ChatModal, CommunityScreen

#### File and Data Services
- **FileShareService** (services/FileShareService.ts)
  - Manages file uploads and sharing
  - Dependencies: None (core service)
  - Used by: FileUploader, PhotoUploadModal, SharedFilesTab

- **SearchService** (services/SearchService.ts)
  - Provides search functionality across the platform
  - Dependencies: None (core service)
  - Used by: GlobalSearchModal, All catalog services

### Analytics and Intelligence Services

#### Analytics Services
- **AnalyticsService** (services/AnalyticsService.ts)
  - Core analytics and reporting
  - Dependencies: None (core service)
  - Used by: AnalyticsDashboardPanel, AdminKPIsTab, All dashboards

- **CostAnalysisService** (services/CostAnalysisService.ts)
  - Analyzes project costs and budgets
  - Dependencies: AnalyticsService, CurrencyService
  - Used by: BudgetTab, CostBreakdownPanel, ROIEstimatorPanel

- **ForecastService** (services/ForecastService.ts)
  - Provides predictive analytics
  - Dependencies: AnalyticsService, MaterialService
  - Used by: ForecastModal, MaterialForecastPanel

#### Safety and Compliance Services
- **SafetyService** (services/SafetyService.ts)
  - Manages safety protocols and incidents
  - Dependencies: NotificationService, FileShareService
  - Used by: SafetyLogTab, SafetyIncidentForm, PPEComplianceScanner

- **SafetyLogService** (services/SafetyLogService.ts)
  - Handles safety logging and reporting
  - Dependencies: SafetyService, AnalyticsService
  - Used by: SafetyLogPanel, SafetyReportExporter

### Platform Services

#### Localization Services
- **LocalizationService** (services/LocalizationService.ts)
  - Handles multi-language support
  - Dependencies: None (core service)
  - Used by: LanguagePicker, All UI components

- **CurrencyService** (services/CurrencyService.ts)
  - Manages multi-currency support
  - Dependencies: LocalizationService
  - Used by: CurrencyToggle, All financial components

- **TimezoneService** (services/TimezoneService.ts)
  - Handles timezone conversions
  - Dependencies: LocalizationService
  - Used by: TimezoneToggle, All time-related components

#### Smart Contract Services
- **SmartContractService** (services/SmartContractService.ts)
  - Manages blockchain smart contracts
  - Dependencies: EscrowService, NotificationService
  - Used by: SmartContractViewer, EscrowService

- **GuaranteeService** (services/GuaranteeService.ts)
  - Handles rental guarantees and claims
  - Dependencies: SmartContractService, PaymentService
  - Used by: RentalGuaranteeToggle, GuaranteeClaimModal

#### Review and Rating Services
- **ReviewService** (services/ReviewService.ts)
  - Manages user reviews and ratings
  - Dependencies: NotificationService, AnalyticsService
  - Used by: ReviewModal, StarRating, ReviewsTab

- **ReferralService** (services/ReferralService.ts)
  - Handles referral programs
  - Dependencies: NotificationService, PaymentService
  - Used by: InviteFriendsTab, ReferralAnalytics

## Service Dependency Graph

### Core Dependencies (Level 1)
- NotificationService (used by 80% of services)
- AnalyticsService (used by 60% of services)
- SearchService (used by 40% of services)
- LocalizationService (used by 50% of services)

### Business Logic Dependencies (Level 2)
- PaymentService → EscrowService → SmartContractService
- MaterialService → InventoryService → ForecastService
- LaborRequestService → LaborMatchingService → SkillMatrixService
- MachineryRequestService → BookingMatchingService → MachineryCatalogService

### Specialized Dependencies (Level 3)
- BIMConceptMapService → ProgressTrackingService → SiteService
- SafetyLogService → SafetyService → NotificationService
- AINotificationService → NotificationService → AnalyticsService
- TaxService → CurrencyService → LocalizationService

This hierarchy shows how services are organized and depend on each other, making it easier to understand the data flow and service interactions throughout the application.