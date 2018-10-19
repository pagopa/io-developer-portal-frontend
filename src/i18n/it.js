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
    openapi: "Specifiche OpenAPI"
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
    send: "invia"
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
    change_password: "Cambia password",
    services: "Servizi registrati",
    subscription: "Sottoscrizione",
    primary_key: "Chiave primaria",
    secondary_key: "Chiave secondaria",
    regenerate: "Rigenera",
    use: "Usa questa chiave",
    add: "Aggiungi sottoscrizione"
  },
  service: {
    send_as: "Invio per conto di",
    no_services: "Nessuna API key selezionata!",
    name: "Nome servizio",
    department: "Dipartimento",
    organization: "Ente",
    organization_fiscal_code: "Codice fiscale ente",
    authorized_recipients: "Codici fiscali destinatari autorizzati",
    authorized_ips: "IP di origine autorizzati",
    max_allowed_payment_amount: "Importo massimo autorizzato",
    eurocents: "eurocents",
    edit: "Modifica i dati del servizio",
    save: "Salva i dati del servizio",
    title: "Servizio"
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
    amount: "Per favore digita l'importo in Centesimi ed il Numero di Avviso"
  }
};

export default it;
