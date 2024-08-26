export const enMnestix = {
    welcome: 'Welcome to Mnestix',
    digitalTwinMadeEasy: 'Digital Twin made easy.',
    notFound: 'Not found',
    cannotLoadAasId: {
        header: 'AAS could not be loaded.',
        text: 'Unable to load AAS for asset with id {assetId}',
    },
    idShort: 'idShort: {idShort}',
    manufacturer: 'Manufacturer: {manufacturerName}',
    aasId: 'AAS ID',
    assetId: 'Asset ID',
    aasOrAssetId: 'AAS ID or Asset ID',
    orEnterManual: 'or enter manually',
    orSelectFromList: 'or select via list',
    goToListButton: 'Go to Aas List',
    scanAasId: 'Scan AAS ID or Asset ID',
    unexpectedError: 'Unexpected error',
    settings: 'Settings',
    idStructure: 'ID structure',
    idStructureExplanation:
        'Define, how your IDs are represented. This is a standard setting that can be adjusted for individual imports.',
    mnestixConnections: 'Mnestix Connections',
    mnestixConnectionsExplanation: 'Define which data connections should be used.',
    menstixConnectionsRepositories: 'AAS Repositories',
    menstixConnectionsRepositoryLabel: 'AAS Repository',
    mnestixConnectionsAddButton: 'Add more',
    submodels: 'Submodels',
    unknownModelType: 'Unknown ModelType: {type}',
    nameplateAddressTypes: {
        office: 'Office',
        'office mobile': 'Office mobile',
        secretary: 'Secretary',
        substitute: 'Substitute',
        home: 'Home',
        'home mobile': 'Home mobile',
        '0173-1#07-AAS754#001': 'Office',
        '0173-1#07-AAS755#001': 'Office mobile',
        '0173-1#07-AAS756#001': 'Secretary',
        '0173-1#07-AAS757#001': 'Substitute',
        '0173-1#07-AAS758#001': 'Home',
        '0173-1#07-AAS759#001': 'Private mobile',
    },
    VAT: 'VAT-Number',
    showEntriesButton: {
        show: 'Show {count} entries',
        hide: 'Hide',
    },
    boolean: {
        true: 'true',
        false: 'false',
    },
    notAvailable: '-',
    staticPrefix: 'static prefix',
    dynamicPart: 'dynamic part',
    assetAdministrationShell: 'Asset Administration Shell',
    asset: 'Asset',
    errorMessages: {
        invalidIri: 'Has to be a valid IRI, e.g. https://example.com/',
        invalidIriPart: 'Has to work as part of an IRI (no "/", spaces or special characters)',
        invalidDate: 'Has to be a valid date in format "yyyy-mm-dd"',
        invalidLong: 'Has to be a valid long',
        influxError: 'There was a problem retrieving the time series data.',
    },
    productCarbonFootprint: {
        totalCO2Equivalents: 'CO2 emissions from product (so far)',
        completedStages: 'Emissions calculated based on product life cycle',
        co2EDistribution: 'CO2e distribution',
        co2EComparison: 'Comparison',
        beech: 'Beech Tree',
        years: 'Years',
        months: 'Months',
        comparisonAssumption: 'Assuming one beech tree stores 12.5 kg CO2e per year.',
        productJourney: 'Product Journey',
        calculationMethod: 'Calculation Method',
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
        count: 'Count',
        elementName: 'Element',
    },
    coffeeConsumption: {
        initialHeadingText: 'To see your personal coffee consumption here, book your first coffee in our ',
        initialHeadingLink: 'WebApp',
        title: 'Your personal coffee consumption',
        drunken: 'Cups',
        coffeeKind: 'Coffee type',
    },
    successfullyUpdated: 'Updated successfully',
    templates: 'Templates',
    all: 'All',
    custom: 'Custom',
    noTemplatesFound: 'No templates found',
    templatesUseExplanation:
        'Templates allow you to create a reusable submodel structure, adjusted to your requirements.',
    semanticId: 'semanticId',
    createNew: 'Create New',
    chooseAStartingPoint: 'Choose a starting point',
    emptyCustom: 'Empty (Custom)',
    emptyCustomDescription: 'Is not based upon a standardized template',
    edit: 'Edit',
    delete: 'Delete',
    deleteTemplateQuestion: 'Delete template "{name}" irretrievably?',
    cancel: 'Cancel',
    duplicate: 'Duplicate',
    saveChanges: 'Save changes',
    noDataFound: 'No Data found',
    noDataFoundFor: 'No data found for "{name}".',
    toHome: 'To Home',
    authenticationNeeded: 'Authentication needed',
    login: 'Login',
    logout: 'Logout',
    templateDeletedSuccessfully: 'Template deleted successfully.',
    defaultValue: 'Default value',
    add: 'Add',
    remove: 'Remove',
    value: 'Value',
    revertChanges: 'Revert changes',
    restore: 'Restore',
    changesSavedSuccessfully: 'Changes saved successfully.',
    findOutMore: 'Find out more',
    dashboard: 'Dashboard',
    repository: 'Repository',
    home: 'Home',
    list: 'AAS list',
    mnestix: 'Mnestix',
    displayName: 'Display name',
    view: 'View',
    details: 'Details',
    text: 'Text',
    language: 'Language',
    redirectsTo: 'Redirects to',
    endResult: 'End result',
    assetIdDocumentation: {
        title: 'How to connect your Asset ID with your AAS Repository',
        industry40Heading: 'Industry 4.0 context',
        industry40Text:
            'Products have a globally unique ID which can be assigned to one or more asset administration shells. In the Industry 4.0 context, the connection between asset and AAS is established via the I4.0 infrastructure.',
        dnsHeading: 'Access via DNS',
        dnsText:
            'Especially for the brownfield approach and the distributor of a product, it makes sense to additionally set up DNS access through the asset ID and thus enable data retrieval from conventional browser applications.',
        exampleHeading: 'Example Case',
    },
    documentDetails: 'Document details',
    open: 'Open',
    mappingInfo: 'Mapping info',
    mappingInfoDescription: 'Arbitrary identifier that you can use for your data imports.',
    multiplicity: 'Multiplicity',
    multiplicityDescription: 'A qualifier used to identify obligatory elements.',
    deleted: 'deleted',
    compareButton: 'Compare',
    compare: {
        title: 'Compare AAS',
        addButton: 'Add another AAS',
        addFirstAasButton: 'Add AAS',
        addAnother: 'Add another AAS',
        assetIdNotFound: 'Asset Id not found',
        aasAlreadyAdded: 'AAS cannot be added more than once',
        moreAasFound: 'More than one AAS found in the discovery service, please provide the AAS ID instead.',
    },
    compareCollection: {
        show: '{idShort}',
        hide: 'Hide',
    },
    aasList: {
        header: 'AAS List',
        subtitle: 'Select up to 3 AASs to compare and narrow down the list by using the product class filter.',
        picture: 'Picture',
        manufacturerHeading: 'Manufacturer Name',
        productDesignationHeading: 'Manufacturer Product Designation',
        assetIdHeading: 'Asset ID',
        aasIdHeading: 'AAS ID',
        productClassHeading: 'Product Class',
        goToCompare: 'Compare',
        maxElementsWarning: 'Cannot compare more than 3 elements',
        compareTooltip: 'Compare',
        showAll: 'All product classes',
        notAvailable: 'Not available',
        titleComparisonAddButton: 'Add AAS to comparison',
        titleProductChipNotAvailable: 'Product Class of AAS not available',
        titleViewAASButton: 'View AAS',
        productClassHint: 'results for Product Class',
        productClasses: {
            '27-27': 'Sensor technology, safety-related sensor technology',
            '51-01': 'Actuator (pneumatics)',
            '51-02': 'Handling (pneumatics)',
            '51-03': 'Valve (pneumatics)',
            '51-04': 'Valve module (pneumatics)',
            '51-05': 'Compressed air preparation (pneumatics)',
            '51-06': 'Vacuum technology (pneumatics)',
            '51-07': 'Pneumatic Connection technology (pneumatics)',
            '51-08': 'Pneumatic and electropneumatic control system (pneumatics)',
            '51-09': 'Documentation and Software (pneumatics)',
            '51-41': 'Pump (hydraulics)',
            '51-42': 'Motor (hydraulics)',
            '51-43': 'Transmission (hydraulics)',
            '51-44': 'Switching valve (hydraulics)',
            '51-45': 'Continuous control valve (hydraulics)',
            '51-46': 'Two-port-slip-in cartridge valve (hydraulics)',
            '51-47': 'Control system (hydraulics)',
            '51-48': 'Cylinder, electro hydraulic actuator, self contained actuator (hydraulics)',
            '51-49': 'Power unit (hydraulics)',
            '51-51': 'Hydraulic accumulator (hydraulics)',
            '51-52': 'Filter (hydraulics)',
            '51-56': 'Pneumatic connection technology (hydraulics)',
            '51-57': 'Heating technology (hydraulics)',
        },
    },
    themeSettings: {
        heading: 'Theme',
        description: 'Define the theme of Mnestix.',
        primaryColorLabel: 'Primary color',
        secondaryColorLabel: 'Secondary color',
        logo: 'Logo',
        submitButton: 'Submit Theme',
        resetButton: 'Reset to default',
        logoHelperText: 'base64 encoded',
    },
    discoveryList: {
        header: 'Discovery result list',
        aasIdHeading: 'AAS ID',
        repositoryUrl: 'Repository Url',
        subtitle: 'Asset ID',
    },
};
