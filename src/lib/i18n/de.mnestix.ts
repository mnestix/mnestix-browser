export const deMnestix = {
    welcome: 'Willkommen bei Mnestix',
    digitalTwinMadeEasy: 'Digitaler Zwilling leicht gemacht.',
    notFound: 'Nicht gefunden',
    aasUrlNotFound: 'Keine Verwaltungsschale unter dieser ID.',
    cannotLoadAasId: {
        header: 'Verwaltungsschale konnte nicht geladen werden.',
        text: 'Es konnte keine Verwaltungsschale für das Asset mit id {assetId} geladen werden.',
    },
    idShort: 'idShort: {idShort}',
    manufacturer: 'Hersteller: {manufacturerName}',
    aasId: 'AAS ID',
    assetId: 'Asset ID',
    aasOrAssetId: 'AAS ID oder Asset ID',
    orEnterManual: 'oder manuell eingeben',
    orSelectFromList: 'oder über Liste suchen',
    goToListButton: 'Zur Aas Liste',
    scanAasId: 'AAS ID oder Asset ID scannen',
    unexpectedError: 'Unerwarteter Fehler',
    unauthorizedError: {
      title: 'Unautorisierter Zugriff',
      content: 'Sie haben keinen Zugriff auf diese AAS. Bitte loggen Sie sich ein oder fragen sie Ihren Administrator um Zugriff.',
    },
    settings: 'Einstellungen',
    idStructure: 'ID Struktur',
    idStructureExplanation:
        'Definieren Sie, wie Ihre IDs aussehen sollen. Dies ist eine Basis-Einstellung, die für individuelle Importe angepasst werden kann.',
    connections: {
        title: 'Mnestix Quellen',
        subtitle: 'Definieren Sie, welche Datenquellen verwendet werden sollen.',
        repositories: 'AAS Repositorys',
        repositoryLabel: 'AAS Repository',
        repositoryUrlLabel: 'AAS Repository Url',
        repositoryDefaultLabel: 'Default AAS Repository',
        addButton: 'Hinzufügen',
        editButton: 'Alle bearbeiten',
        saveButton: 'Alle speichern',
        resetButton: 'Auf Default zurücksetzen',
        resetSuccessfull: 'Quellen wurden zurückgesetzt.',
        urlFieldRequired: 'URL wird benötigt',
    },
    submodels: 'Submodelle',
    unknownModelType: 'Unbekannter ModelType: {type}',
    nameplateAddressTypes: {
        office: 'Geschäftlich',
        'office mobile': 'Geschäftl. Mobil',
        secretary: 'Sekretariat',
        substitute: 'Vertretung',
        home: 'Privat',
        'home mobile': 'Privat Mobil',
        '0173-1#07-AAS754#001': 'Geschäftlich',
        '0173-1#07-AAS755#001': 'Geschäftlich Mobil',
        '0173-1#07-AAS756#001': 'Sekretariat',
        '0173-1#07-AAS757#001': 'Vertretung',
        '0173-1#07-AAS758#001': 'Privat',
        '0173-1#07-AAS759#001': 'Privat Mobil',
    },
    VAT: 'USt-IdNr.',
    showEntriesButton: {
        show: '{count} Einträge anzeigen',
        hide: 'Verbergen',
    },
    boolean: {
        true: 'Wahr',
        false: 'Falsch',
    },
    notAvailable: '-',
    staticPrefix: 'statisches Präfix',
    dynamicPart: 'dynamischer Teil',
    assetAdministrationShell: 'Verwaltungsschale',
    asset: 'Asset',
    errorMessages: {
        invalidIri: 'Muss eine valide IRI sein. Z.B. https://example.com/',
        invalidIriPart: 'Muss als Teil einer IRI funktionieren können (kein "/", Leer- und Sonderzeichen)',
        invalidDate: 'Muss ein gültiges Datum sein, im Format "yyyy-mm-dd"',
        invalidLong: 'Muss eine valide Zahl sein',
        influxError: 'Beim Abrufen der Daten ist ein Fehler aufgetreten.',
    },
    productCarbonFootprint: {
        totalCO2Equivalents: '(Bisherige) CO2 Emissionen des Produkts',
        completedStages: 'Emissionen berechnet basierend auf folgenden Lebenszyklusphasen',
        co2EDistribution: 'CO2e Verteilung',
        co2EComparison: 'Vergleich',
        beech: 'Buche',
        years: 'Jahre',
        months: 'Monate',
        comparisonAssumption: 'Unter der Annahme von 12,5 kg CO2e Speicherung pro Jahr.',
        productJourney: 'Produktreise',
        calculationMethod: 'Berechnungsmethode',
        lifecycleStages: {
            A1: 'A1 - raw material supply (and upstream production)',
            A2: 'A2 - cradle-to-gate transport to factory',
            A3: 'A3 - production',
            A4: 'A4 - transport to final destination',
            B1: 'B1 - usage phase',
            B2: 'B2 - maintenance',
            B3: 'B3 - repair',
            B5: 'B5 - update/upgrade, refurbishing',
            B6: 'B6 - usage energy consumption',
            B7: 'B7 - usage water consumption',
            C1: 'C1 - reassembly',
            C2: 'C2 - transport to recycler',
            C3: 'C3 - recycling, waste treatment',
            C4: 'C4 - landfill',
            D: 'D - reuse',
        },
    },
    referenceCounter: {
        count: 'Anzahl',
        elementName: 'Element',
    },
    coffeeConsumption: {
        initialHeadingText: 'Um hier deinen persönlichen Kaffeekonsum zu sehen, buche deinen ersten Kaffee in unserer ',
        initialHeadingLink: 'WebApp',
        title: 'Dein persönlicher Kaffeekonsum',
        drunken: 'Anzahl getrunken',
        coffeeKind: 'Kaffeesorte',
    },
    successfullyUpdated: 'Erfolgreich aktualisiert',
    templates: 'Vorlagen',
    all: 'Alle',
    custom: 'Individuell',
    noTemplatesFound: 'Keine Vorlagen gefunden',
    templatesUseExplanation:
        'Vorlagen erlauben es Ihnen, eine wiederverwendbare Submodell-Struktur zu definieren, angepasst auf Ihre Bedürfnisse.',
    semanticId: 'semanticId',
    createNew: 'Neu erstellen',
    chooseAStartingPoint: 'Wählen Sie einen Ausgangspunkt',
    emptyCustom: 'Leer (Individuell)',
    emptyCustomDescription: 'Basiert auf keiner standardisierten Vorlage',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    deleteTemplateQuestion: 'Vorlage "{name}" unwiderruflich löschen?',
    duplicate: 'Duplizieren',
    cancel: 'Abbrechen',
    saveChanges: 'Änderungen speichern',
    noDataFound: 'Keine Daten gefunden',
    noDataFoundFor: 'Es wurden keine Daten für "{name}" gefunden.',
    toHome: 'Zur Startseite',
    authenticationNeeded: 'Authentifizierung erforderlich',
    login: 'Anmelden',
    logout: 'Abmelden',
    templateDeletedSuccessfully: 'Vorlage erfolgreich gelöscht.',
    defaultValue: 'Vorgegebener Wert',
    add: 'Hinzufügen',
    remove: 'Entfernen',
    value: 'Wert',
    revertChanges: 'Änderungen zurücksetzen',
    restore: 'Wiederherstellen',
    changesSavedSuccessfully: 'Änderungen erfolgreich gespeichert.',
    findOutMore: 'Mehr Informationen',
    dashboard: 'Dashboard',
    repository: 'Repository',
    home: 'Startseite',
    list: 'AAS Liste',
    mnestix: 'Mnestix',
    displayName: 'Anzeigename',
    view: 'Ansehen',
    details: 'Details',
    text: 'Text',
    language: 'Sprache',
    redirectsTo: 'Leitet weiter auf',
    endResult: 'Endergebnis',
    assetIdDocumentation: {
        title: 'Wie Sie Ihre Asset ID mit Ihrem Repository verbinden',
        industry40Heading: 'Industrie 4.0 Kontext',
        industry40Text:
            'Produkte haben eine global einzigartige ID, welche einer oder mehreren Verwaltungschale(n) zugewiesen werden kann. Im Industrie 4.0 Kontext wird die Verbindung zwischen Asset und Verwaltungsschale über die I4.0 Infrastruktur hergestellt.',
        dnsHeading: 'Zugriff via DNS',
        dnsText:
            'Besonders beim "Brownfield"-Ansatz und als Vertreiber eines Produkts ist es sinnvoll, zusätzlich einen DNS-Zugang über die Asset ID einzurichten, um so einen Datenzugriff über einen herkömmlichen Browser zu ermöglichen.',
        exampleHeading: 'Beispiel',
    },
    documentDetails: 'Dokumentendetails',
    open: 'Öffnen',
    mappingInfo: 'Mapping-Info',
    mappingInfoDescription: 'Frei wählbarer Identifikator, auf den Sie bei Datenimporten zurückgreifen können.',
    multiplicity: 'Multiplicity',
    multiplicityDescription: 'Parameter, mit dem Sie festlegen können, welche Elemente verpflichtend sind.',
    deleted: 'gelöscht',
    compareButton: 'Vergleichen',
    compare: {
        title: 'Verwaltungsschalen vergleichen',
        addButton: 'Eine weitere Verwaltungsschale hinzufügen',
        addFirstAasButton: 'Eine Verwaltungsschale hinzufügen',
        addAnother: 'Eine weitere Verwaltungsschale hinzufügen',
        assetIdNotFound: 'Asset Id nicht gefunden',
        aasAlreadyAdded: 'Verwaltungsschale kann nicht mehrmals hinzugefügt werden',
        moreAasFound: 'Mehr als eine Verwaltungsschale im Discovery Service gefunden, bitte geben Sie die AAS-ID an.',
        aasAddError: 'Verwaltungsschale konnte nicht hinzugefügt werden.',
    },
    compareCollection: {
        show: '{idShort}',
        hide: 'Verbergen',
    },
    aasList: {
        header: 'AAS List',
        subtitle:
            'Wählen Sie bis zu 3 Verwaltungsschalen zum Vergleichen aus und grenzen Sie die Liste mithilfe des Produktklassenfilters ein.',
        picture: 'Bild',
        manufacturerHeading: 'Hersteller Name',
        productDesignationHeading: 'Hersteller Produktbezeichnung',
        assetIdHeading: 'Asset ID',
        aasIdHeading: 'AAS ID',
        productClassHeading: 'Produktklasse',
        goToCompare: 'Zum Vergleich',
        maxElementsWarning: 'Maximal 3 Elemente selektierbar',
        compareTooltip: 'Vergleichen',
        showAll: 'Alle Produktklassen',
        notAvailable: 'Nicht verfügbar',
        titleComparisonAddButton: 'Füge VWS zum Vergleich hinzu',
        titleProductChipNotAvailable: 'Produktklasse der VWS nicht verfügbar',
        titleViewAASButton: 'VWS anzeigen',
        productClassHint: 'Ergebnisse für Produktklasse',
        productClasses: {
            '27-27': 'Sensorik, sicherheitsgerichtete Sensorik',
            '51-01': 'Antrieb (pneumatics)',
            '51-02': 'Handhabung (pneumatics)',
            '51-03': 'Ventil (pneumatics)',
            '51-04': 'Ventilbaugruppe (pneumatics)',
            '51-05': 'Druckluftaufbereitung (pneumatics)',
            '51-06': 'Vakuumtechnik (pneumatics)',
            '51-07': 'Leitung und Leitungsverbindung (pneumatics)',
            '51-08': 'Pneumatische und elektropneumatische Steuerung (pneumatics)',
            '51-09': 'Dokumentation und Software (pneumatics)',
            '51-41': 'Pumpe (hydraulics)',
            '51-42': 'Motor (hydraulics)',
            '51-43': 'Getriebe (hydraulics)',
            '51-44': 'Ventil Schaltfunktion (hydraulics)',
            '51-45': 'Ventil Stetigfunktion (hydraulics)',
            '51-46': 'Logikventil (hydraulics)',
            '51-47': 'Steuerung (hydraulics)',
            '51-48': 'Zylinder, autarke Achse und elektrohydraulischer Antrieb (hydraulics)',
            '51-49': 'Hydroaggregat (hydraulics)',
            '51-51': 'Hydrospeicher (hydraulics)',
            '51-52': 'Filter (hydraulics)',
            '51-56': 'Leitung und Leitungsverbindung (hydraulics)',
            '51-57': 'Wärmetechnik (hydraulics)',
        },
    },
    themeSettings: {
        heading: 'Theme',
        description: 'Definieren Sie das Theme von Mnestix.',
        primaryColorLabel: 'Primärfarbe',
        secondaryColorLabel: 'Sekundärfarbe',
        logo: 'Logo',
        submitButton: 'Theme speichern',
        resetButton: 'Zurücksetzen',
        logoHelperText: 'base64 encoded',
    },
    discoveryList: {
        header: 'Ergebnisliste der Discovery',
        aasIdHeading: 'AAS ID',
        repositoryUrl: 'Repository Url',
        subtitle: 'Asset ID',
    },
    qrScanner: {
        defaultCallbackErrorMsg: 'QR Code konnte nicht geöffnet werden!',
        errorOnQrScannerOpen: 'QR Scanner konnte nicht geöffnet werden!',
    },
};
