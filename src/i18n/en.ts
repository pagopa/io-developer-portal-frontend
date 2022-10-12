const en = {
  aside: {
    dashboard: "Dashboard",
    users: "Registered users",
    profile: "Services",
    send: "Send message",
    send_from_file: "Send from file",
    send_from_template: "Send with Template",
    contacts: "Contacts",
    sent: "Messages Sent",
    openapi: "OpenAPI specifications",
    logo_organization: "Logo Organnization"
  },
  login: {
    message: "You're being redirected to the Sign in page"
  },
  dashboard: {
    templates: "Templates",
    messages: "Messages",
    contacts: "Contacts"
  },
  compose: {
    send: "Send",
    subject: "Subject",
    markdown: "Message",
    due_date: "Due date",
    time: "Time",
    notice: "Notice number",
    amount: "Amount",
    invalid_after_due_date: "Disable the payment after its due date",
    reset: "Reset"
  },
  contacts: {
    fiscal_code: "Fiscal Code",
    no_contacts: "There are no saved contacts"
  },
  compose_import: {
    messages: "messages",
    upload_file: "Upload document (.csv)",
    ignore_header: "Ignore document header",
    name: "Name",
    surname: "Surname",
    fiscal_code: "Fiscal Code",
    subject: "Subject",
    markdown: "Message",
    due_date: "Due date",
    notice: "Notice",
    amount: "Amount",
    send: "send",
    invalid_headers: "Header for the document are invalid"
  },
  message: {
    recipient: "Recipient",
    recipients: "Recipients",
    save: "Save",
    upload_file: "Upload document (.csv)",
    send: "Send",
    send_batch: "Send to the list"
  },
  messages: {
    subject: "Subject",
    sent: "Delivered",
    failed: "Failed",
    queued: "Queued",
    no_messages: "There are no messages sent",
    report: {
      fiscal_code: "Fiscal Code",
      channel: "Channel",
      state: "State"
    }
  },
  profile: {
    new_service: "New Service",
    new_user: "New user",
    key: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    name: "Name",
    surname: "Surname",
    // tslint:disable-next-line:no-hardcoded-credentials
    change_password: "Change password",
    services: "Registered services",
    subscription: "Subscription",
    primary_key: "Primary key",
    secondary_key: "Secondary key",
    regenerate: "Regenerate",
    use: "Use this key",
    add: "Add subscription",
    close: "Close",
    service_draft: "draft",
    service_review: "review",
    service_not_valid: "incomplete or incorrect data",
    service_valid: "active",
    service_loading: "Loading service data",
    create_new_service: "Create new service"
  },
  modal: {
    important: "Important!",
    new_service: "New Service",
    publish_service: "Go Live!",
    publish_confirmation:
      "You confirm that you wish to proceed with the publication request for the service",
    publish_warning:
      "The service can only be published if the account that created it corresponds to the Delegate indicated in the membership agreement. Please check this correspondence before proceeding.",
    publish_details:
      "Once the request has been sent, the service will no longer be modifiable until the moment of publication. The PagoPA team will carry out a verification and will notify you at the time of publication, or will provide you with instructions in the event of a negative outcome of the request.",
    deactive_service: "Disable the Service",
    deactive_confirmation:
      "You confirm that you wish to proceed with the deactivation request for the service",
    deactive_details:
      "Once the request has been entered, the PagoPA team will proceed with the deactivation, from that moment the service will no longer be visible in the app and it will not be possible to use it for communication to citizens",
    add_subscription: "Add subscription",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm"
  },
  service: {
    custom_special_flow: "Custom Special flow Name",
    category: "Service Category",
    STANDARD: "Standard",
    SPECIAL: "Special",
    description_service: "Service Description",
    service_name: "Service Name",
    department_name: "Department Name",
    organization_name: "Organization Name",
    authorized_cidrs: "Authorized origin IP",
    send_as: "Sending as",
    no_services: "No API key selected!",
    name: "Name of the service",
    department: "Department",
    organization: "Organization",
    organization_fiscal_code: "Fiscal Code for Organization",
    authorized_recipients: "Authorized recipients (Fiscal Codes)",
    authorized_ips: "Authorized IPs*",
    example_authorized_ips: "(i.e. 192.168.200.25/32;192.168.200.26/32)",
    max_allowed_payment_amount: "Maximum allowd payment amount",
    visible_service: "Visible in service list",
    eurocents: "eurocents",
    edit: "Edit service's details",
    save: "Save service's details",
    publish: "Publish service",
    unpublish: "Unpublish service",
    save_draft: "Save draft service",
    title: "Service",
    description: "Description*",
    web_url: "Web Url",
    app_ios: "App IOS Url",
    app_android: "App Android Url",
    tos_url: "Terms and Conditions (TOS) Url",
    privacy_url: "Privacy Url*",
    address: "Address",
    phone: "Phone",
    email: "Email",
    pec: "Pec",
    cta: "Cta",
    token_name: "Token Name",
    support_url: "Support Url",
    scope: "Scope",
    metadata: "Metadata",
    service_logo: "Service Logo (PNG)",
    service_logo_upload: "Upload",
    scheda_servizio: "Service Details",
    security_fields: "Security and Permissions",
    contact_fields: "Contact Fields",
    contact_fields_message:
      "You need at least one contact point to citizen assistance",
    national: "National",
    local: "Local",
    service_saved_ok: "Service succesfully saved.",
    service_saved_error: "Error on save Service",
    state: "Service State",
    publish_message:
      "Once you have completed the service sheet, you can proceed to publish it in the app.",
    publish_guide:
      "For more information on the required fields for publication, see our online",
    publish_info:
      "Once the request has been sent, the PagoPA team will carry out a verification and will notify you at the time of publication.",
    published_title: "Congratulations!",
    published:
      "Your service is active and available to citizen users of the IO app",
    unpublish_title: "Service Deactivation",
    unpublish_message:
      "If you no longer want to provide this service to citizens, simply select the option to deactivate the service: it will no longer be visible in the app and will return to the compilation state.",
    publish_error_title: "Warning!",
    publish_error_message:
      "Some fields are missing or incorrect, the service cannot be published",
    publish_error_detail:
      "We ask to correct any errors then submit a new request review again",
    publish_review_title: "We're working on it!",
    publish_review_message:
      "Your service is under review, we will update you as soon as possible",
    deactive_service_title: "Deactivating",
    deactive_service_message:
      "We are working on it, the service will soon be deactivated ",
    guide: "guide",
    admin_properties: "Admin Properties",
    useful_links: "Useful Links",
    national_service_warn:
      "ATTENTION: the current service has the scope value equals to NATIONAL"
  },
  servers: {
    select: "Select your server (endpoint) of choice",
    add: "Add a server",
    default: "default"
  },
  subscription_migrations: {
    open_migrations_panel: "Import Services",
    migrations_summary_title:
      "If you already manage Services in IO Backoffice, you can import them here",
    migrations_summary_latest: "Import status",
    migrations_summary_latest_empty: "No import has been started yet",
    disclaimer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non mauris enim. Aenean pellentesque tristique elit sed pulvinar. Non verranno importati i profili dei delegati associati ai servizi che stai importando, ma solo i servizi stessi. Per tanto, una volta importati i servizi, i/il Referente/i Amministrativo/i associati a App IO dovranno aggiungere i delegati associati al prodotto nell’apposita sezione Referenti.",
    migrations_panel_title: "Import Services",
    migrations_panel_abstract:
      "Here you will find the delegates who work on the services associated with your organization. To import, select the delegates you want to import / services added for each delegate",
    migrations_panel_list: "List of delegates who work for your organization",
    migrations_panel_list_empty:
      "There are no delegates working for your organization",
    close: "Close",
    migrations_panel_start_migration: "Import selected",
    migration_status_todo: "to be started yet",
    migration_status_doing: "executing",
    migration_status_done: "completed",
    migration_status_failed: "failed",
    api_error: "An error occurred",
    api_error_claim_migrations: "One or more ownership claims has failed",
    api_success: "Success",
    api_success_claim_migrations:
      "Ownership claim for selecteded subscriptions has been accepted"
  },
  templates: {
    edit: "Edit",
    send: "Send",
    send_batch: "Send to a list"
  },
  template: {
    subject: "Subject",
    add: "Add template",
    save: "Save"
  },
  users: {
    profile: "Profile",
    name: "Name",
    surname: "Surname",
    email: "Email"
  },
  notification: {
    recipient: "Recipient"
  },
  confirmation: {
    confirm_operation: "Do you want to proceed?",
    proceed: "Confirm",
    cancel: "Cancel"
  },
  format: {
    date: "DD/MM/YYYY, HH:mm",
    time: "HH:mm",
    currency: "€"
  },
  validation: {
    fiscal_code: "Please digit {{max}} alphanumeric characters",
    subject: "Subject has to be between {{length}} characters",
    markdown: "Message has to be between {{length}} characters",
    notice: "Please digit {{max}} numeric characters and the amount",
    amount: "Please digit the amount in eurocents and the notice number",
    field_error: "The field {{field}} is not valid"
  },
  errors: {
    upload_logo: "Upload logo error"
  },
  logoOrganizations: {
    service_logo: "Upload Logo (PNG)",
    service_logo_upload: "Upload",
    organization_fiscal_code: "Invalid organization fiscal code"
  },
  toasterMessage: {
    save_form: "Service Saving",
    save_service_error: "Error on saving service",
    save_service: "Service saved",
    errors_form: "Errors on forms",
    errors_description: "There are some errors, check your form!",
    jira_title: "Jira",
    jira_success: "Ticket creato",
    jira_error: "There are some errors with Jira",
    jira_ticket_moved: "Ticket moved",
    jira_ticket_openend: "Ticket already opened",
    list_errors: "Show errors details"
  }
};

export default en;
