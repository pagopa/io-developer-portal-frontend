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
    openapi: "OpenAPI specifications"
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
    change_password: "Change password",
    services: "Registered services",
    subscription: "Subscription",
    primary_key: "Primary key",
    secondary_key: "Secondary key",
    regenerate: "Regenerate",
    use: "Use this key",
    add: "Add subscription"
  },
  service: {
    send_as: "Sending as",
    no_services: "No API key selected!",
    name: "Name of the service",
    department: "Department",
    organization: "Organization",
    organization_fiscal_code: "Fiscal Code for Organization",
    authorized_recipients: "Authorized recipients (Fiscal Codes)",
    authorized_ips: "Authorized IPs",
    max_allowed_payment_amount: "Maximum allowd payment amount",
    visible_service: "Visible in service list",
    eurocents: "eurocents",
    edit: "Edit service's details",
    save: "Save service's details",
    title: "Service"
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
    amount: "Please digit the amount in eurocents and the notice number"
  }
};

export default en;
