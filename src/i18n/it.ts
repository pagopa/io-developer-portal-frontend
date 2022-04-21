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
    new_service: "Nuovo Servizio",
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
    close: "Chiudi",
    service_draft: "bozza",
    service_review: "in review",
    service_not_valid: "dati incompleti o incorretti",
    service_valid: "attivo",
    service_loading: "Recupero dati servizio",
    create_new_service: "Crea un nuovo servizio"
  },
  modal: {
    important: "Importante!",
    new_service: "Nuovo Servizio",
    publish_service: "Go Live!",
    publish_confirmation:
      "Confermi di voler procedere alla richiesta di pubblicazione per il servizio",
    publish_warning:
      "Il servizio potrà essere pubblicato solo se l’account che l’ha creato corrisponde al Delegato indicato nel contratto di adesione. Ti invitiamo a verificare questa corrispondenza prima di procedere.",
    publish_details:
      "Una volta inviata la richiesta il servizio non sarà più modificabile, fino al momento della pubblicazione. Il team PagoPA procederà a una verifica e ti avvertirà al momento dell’avvenuta pubblicazione, o ti fornirà istruzioni in caso di esito negativo della richiesta.",
    deactive_service: "Disattiva il servizio",
    deactive_confirmation:
      "Confermi di voler procedere alla richiesta di disattivazione per il servizio",
    deactive_details:
      "Una volta inserita la richiesta, il team PagoPA procederà alla disattivazione, da quel momento il servizio non sarà più visibile in app e non sarà possibile utilizzarlo per la comunicazione ai cittadini.",
    add_subscription: "Aggiungi sottoscrizione",
    close: "Chiudi",
    cancel: "Annulla",
    confirm: "Conferma"
  },
  service: {
    custom_special_flow: "Nome del flusso Speciale custom",
    category: "Categoria del servizio",
    STANDARD: "Standard",
    SPECIAL: "Speciale",
    description_service: "Descrizione del servizio",
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
    publish: "Pubblica servizio",
    unpublish: "Disattiva il servizio",
    save_draft: "Salva i dati in bozza",
    title: "Servizio",
    description: "Descrizione*",
    web_url: "Web Url",
    app_ios: "App IOS Url",
    app_android: "App Android Url",
    tos_url: "Termini e Condizioni (TOS) Url",
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
    service_logo: "Logo del Servizio (PNG)",
    service_logo_upload: "Upload",
    scheda_servizio: "Scheda Servizio",
    security_fields: "Sicurezza e Permessi",
    contact_fields: "Dati di contatto",
    contact_fields_message: "È necessario almeno un dato di contatto",
    national: "Nazionale",
    local: "Locale",
    service_saved_ok: "Scheda Servizio salvata correttamente",
    service_saved_error: "Errore nel salvataggio della Scheda Servizio",
    state: "Stato Servizio",
    publish_message:
      "Una volta completata la scheda servizio, puoi procedere alla pubblicazione in app.",
    publish_guide:
      "Per maggiori informazioni sui campi obbligatori per la pubblicazione, consulta la nostra",
    publish_info:
      "Una volta inviata la richiesta, il team PagoPA procederà a una verifica e ti avvertirà al momento dell’avvenuta pubblicazione.",
    published_title: "Congratulazioni!",
    published:
      "Il tuo servizio è attivo e disponibile ai cittadini utenti di app IO",
    unpublish_title: "Disattivazione del servizio",
    unpublish_message:
      "Se non vuoi più erogare questo servizio ai cittadini è sufficiente selezionare l’opzione di disattivazione del servizio: non sarà più visibile in app e tornerà in stato di compilazione.",
    publish_error_title: "Attenzione!",
    publish_error_message:
      "Alcuni campi risultano mancanti o incorretti, il servizio non può essere pubblicato",
    publish_error_detail:
      "Ti invitiamo a correggere gli errori segnalati e reinviare una nuova richiesta di review",
    publish_review_title: "Ci Stiamo lavorando!",
    publish_review_message:
      "Il tuo servizio è in corso di revisione, ti aggiorneremo al più presto",
    deactive_service_title: "In corso di disattivazione",
    deactive_service_message:
      "Ci stiamo lavorando, il servizio verrà presto disattivato",
    guide: "guida",
    admin_properties: "Proprietà Admin",
    useful_links: "Links Utili",
    national_service_warn:
      "ATTENZIONE: il servizio corrente ha il valore di scope impostato a NATIONAL"
  },
  servers: {
    select: "Seleziona il server (endpoint) predefinito",
    add: "Aggiungi un server",
    default: "default"
  },
  subscription_migrations: {
    open_migrations_panel: "Importa i Servizi",
    migrations_summary_title:
      "Se hai già dei servizi attivi su IO che gestivi nel IO Backoffice puoi importarli qui",
    migrations_summary_latest: "Stato dell'importazione",
    migrations_summary_latest_empty: "Nessuna importazioni avviata",
    disclaimer:
      "L’importazione dei tuoi servizi dal portale IO Backoffice comporta orem ipsum dolor sit amet, consectetur adipiscing elit. In non mauris enim. Aenean pellentesque tristique elit sed pulvinar. Non verranno importati i profili dei delegati associati ai servizi che stai importando, ma solo i servizi stessi. Per tanto, una volta importati i servizi, i/il Referente/i Amministrativo/i associati a App IO dovranno aggiungere i delegati associati al prodotto nell’apposita sezione Referenti.",
    migrations_panel_title: "Importa i Servizi",
    migrations_panel_abstract:
      "Qui trovi i delegati che operano sui servizi associati al tuo Ente. Per effettuare l’importazione seleziona i delegati che vuoi importare / servizi aggiunti per ogni delegato",
    migrations_panel_list: "Lista dei delegati che operano per il tuo Ente",
    migrations_panel_list_empty:
      "Non ci sono delegati che operano per il tuo Ente",
    close: "Chiudi",
    migrations_panel_start_migration: "Importa selezionati",
    migration_status_todo: "da avviare",
    migration_status_doing: "in esecuzione",
    migration_status_done: "completata",
    migration_status_failed: "fallita",
    api_error: "Si è verificato un errore",
    api_error_claim_migrations:
      "Una o più migrazioni richieste non sono andate a buon fine"
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
  },
  toasterMessage: {
    save_form: "Salvataggio del Servizio",
    save_service_error: "Errore nel salvataggio del servizio",
    save_service: "Servizio salvato correttamente",
    errors_form: "Errori nella form",
    errors_description: "Ci sono degli errori, controlla la tua form!",
    jira_title: "Jira",
    jira_success: "Ticket creato",
    jira_error: "Si è verificato un errore con Jira",
    jira_ticket_moved: "Ticket spostato",
    jira_ticket_openend: "Ticket già esistente",
    list_errors: "Vedi elenco errori"
  },
  footer: {
    pagopaInfo:
      "PagoPA S.p.A. - Società per azioni con socio unico - Capitale sociale di euro 1,000,000 interamente versato - Sede legale in Roma, Piazza Colonna 370, CAP 00187 - N. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009",
    privacyPolicy: "Privacy Policy",
    terms: "Termini e Condizioni",
    security: "Sicurezza delle informazioni",
    accessibility: "Accessibilità"
  },
  header: {
    assistance: "Assistenza",
    exit: "Esci",
    reserved: "Area Riservata",
  },
};

export default it;
