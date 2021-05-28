const en = {
  aside: {
    dashboard: "Dashboard",
    users: "Registered users",
    profile: "Profile (subscriptions)",
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
    service_draft: "Service in draft",
    service_not_active: "Service not active",
    service_not_valid: "Fields not valid, service not active",
    service_active: "Service active",
    service_loading: "Loading service data"
  },
  service: {
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
    save_draft: "Save draft service",
    title: "Service",
    description: "Description*",
    web_url: "Web Url",
    app_ios: "App IOS",
    app_android: "App Android",
    tos_url: "Tos Url",
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
    service_logo: "Upload Logo (PNG)",
    service_logo_upload: "Upload",
    scheda_servizio: "Service Details",
    contact_fields: "Contact Fields",
    contact_fields_message:
      "You need at least one contact point to citizen assistance",
    national: "National",
    local: "Local",
    service_saved_ok: "Service succesfully saved.",
    service_saved_error: "Error on save Service"
  },
  servers: {
    select: "Select your server (endpoint) of choice",
    add: "Add a server",
    default: "default"
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
  }
};

export default en;
