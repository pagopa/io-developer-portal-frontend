const it = {
  aside: {
    dashboard: "Dashboard",
    users: "Utenti registrati",
    profile: "Profilo (sottoscrizioni)",
    send: "Invio rapido",
    send_from_file: "Invio da files",
    send_from_template: "Invio con Template",
    contacts: "Contatti",
    sent: "Messaggi inviati",
    openapi: "Specifiche OpenAPI",
    logo_organization: "Logo Organizzazione"
  },
  login: {
    message: "Stai per essere reindirizzato alla pagina di Sign in"
  },
  dashboard: {
    templates: "Template",
    messages: "Messaggi",
    contacts: "Contatti"
  },
  compose: {
    send: "Invia",
    subject: "Oggetto",
    markdown: "Messaggio",
    due_date: "Scadenza",
    time: "Orario",
    notice: "N° Avviso",
    amount: "Importo",
    invalid_after_due_date: "Disabilita il pagamento dopo la scadenza",
    reset: "Reset"
  },
  contacts: {
    fiscal_code: "Codice Fiscale",
    no_contacts: "Non ci sono contatti salvati"
  },
  compose_import: {
    messages: "messaggi",
    upload_file: "Carica documento (.csv)",
    ignore_header: "Ignora l'intestazione del file",
    name: "Nome",
    surname: "Cognome",
    fiscal_code: "Codice Fiscale",
    subject: "Oggetto",
    markdown: "Messaggio",
    due_date: "Scadenza",
    notice: "Avviso",
    amount: "Importo",
    send: "invia",
    invalid_headers: "Gli header del documento non sono validi"
  },
  message: {
    recipient: "Destinatario",
    recipients: "Destinatari",
    save: "Salva",
    upload_file: "Carica documento (.csv)",
    send: "Invia",
    send_batch: "Invia alla lista"
  },
  messages: {
    subject: "Oggetto",
    sent: "Consegnati",
    failed: "Falliti",
    queued: "In coda",
    no_messages: "Non ci sono messaggi inviati",
    report: {
      fiscal_code: "Codice Fiscale",
      channel: "Canale",
      state: "Stato"
    }
  },
  profile: {
    new_user: "Nuovo utente",
    key: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    name: "Nome",
    surname: "Cognome",
    // tslint:disable-next-line:no-hardcoded-credentials
    change_password: "Cambia password",
    services: "Servizi registrati",
    subscription: "Sottoscrizione",
    primary_key: "Chiave primaria",
    secondary_key: "Chiave secondaria",
    regenerate: "Rigenera",
    use: "Usa questa chiave",
    add: "Aggiungi sottoscrizione",
    service_draft: "Servizio in bozza",
    service_not_active: "Servizio non attivo",
    service_not_valid: "Campi non validi, il servizio non è attivo",
    service_active: "Servizio attivo",
    service_loading: "Recupero dati servizio"
  },
  service: {
    service_name: "Nome Servizio",
    department_name: "Nome Dipartimento",
    organization_name: "Nome Ente",
    authorized_cidrs: "IP di origine autorizzati",
    send_as: "Invio per conto di",
    no_services: "Nessuna API key selezionata!",
    name: "Nome servizio",
    department: "Dipartimento",
    organization: "Ente",
    organization_fiscal_code: "Codice fiscale ente",
    authorized_recipients: "Codici fiscali destinatari autorizzati",
    authorized_ips: "Lista IP di origine autorizzati*",
    example_authorized_ips: "(esempio 192.168.200.25/32;192.168.200.26/32)",
    max_allowed_payment_amount: "Importo massimo autorizzato",
    visible_service: "Visibile nella lista servizi",
    eurocents: "eurocents",
    edit: "Modifica i dati del servizio",
    save: "Salva i dati del servizio",
    save_draft: "Salva i dati in bozza",
    title: "Servizio",
    description: "Descrizione*",
    web_url: "Web Url",
    app_ios: "App IOS",
    app_android: "App Android",
    tos_url: "Tos Url",
    privacy_url: "Privacy Url*",
    address: "Indirizzo",
    phone: "Telefono",
    email: "Email",
    pec: "Pec",
    cta: "Cta",
    token_name: "Nome Token",
    support_url: "Url di Supporto",
    scope: "Area di competenza",
    metadata: "Metadati",
    service_logo: "Upload Logo (PNG)",
    service_logo_upload: "Upload",
    scheda_servizio: "Scheda Servizio",
    contact_fields: "Campi di contatto",
    contact_fields_message:
      "È obbligatorio almeno un campo di contatto per assistenza al cittadino",
    national: "Nazionale",
    local: "Locale",
    service_saved_ok: "Scheda Servizio salvata correttamente",
    service_saved_error: "Errore nel salvataggio della Scheda Servizio"
  },
  servers: {
    select: "Seleziona il server (endpoint) predefinito",
    add: "Aggiungi un server",
    default: "default"
  },
  templates: {
    edit: "Modifica",
    send: "Invia ad un destinatario",
    send_batch: "Invia ad una lista"
  },
  template: {
    subject: "Oggetto",
    add: "Aggiungi template",
    save: "Salva"
  },
  users: {
    profile: "Profilo",
    name: "Nome",
    surname: "Cognome",
    email: "Email"
  },
  notification: {
    recipient: "Destinatario"
  },
  confirmation: {
    confirm_operation: "Vuoi confermare l'operazione?",
    proceed: "Procedi",
    cancel: "Annulla"
  },
  format: {
    date: "DD/MM/YYYY, HH:mm",
    time: "HH:mm",
    currency: "€"
  },
  validation: {
    fiscal_code: "Per favore digita {{max}} caratteri alfanumerici",
    subject: "L'oggetto deve essere di {{length}} caratteri",
    markdown: "Il messaggio deve essere di {{length}} caratteri",
    notice: "Per favore digita {{max}} caratteri numerici e l'importo",
    amount: "Per favore digita l'importo in Centesimi ed il Numero di Avviso",
    field_error: "Il campo {{field}} non è valido"
  },
  errors: {
    upload_logo: "Caricamento logo non riuscito"
  },
  logoOrganizations: {
    service_logo: "Upload Logo (PNG)",
    service_logo_upload: "Upload",
    organization_fiscal_code: "Codice Fiscale dell'organizzazione"
  }
};

export default it;
