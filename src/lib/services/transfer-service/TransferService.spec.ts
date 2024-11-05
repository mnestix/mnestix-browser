import { ServiceReachable, TransferService } from 'lib/services/transfer-service/TransferService';
import testData from './TransferService.data.json';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

const aas = testData.transferAas as unknown as AssetAdministrationShell;
const nameplate = testData.transferSubmodelNameplate as unknown as Submodel;
const technical = testData.transferSubmodelTechnicalData as unknown as Submodel;

describe('TransferService: Export AAS', function () {
    const apikey = 'superduperkey';

    // Should include AAS repo, registry, thumbnail, discovery; submodel repo, registry, file
    it('All services given', async () => {

        const service = TransferService.createNull(
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [aas],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [nameplate, technical],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            ServiceReachable.Yes,
        );

        const transferResult = await service.transferAasWithSubmodels(aas, [nameplate, technical], apikey);

        expect(transferResult).length(9);
    });

    // Should have no errors; registries and discovery not in return list
    it('Only repositories given', async () => {
        // const service = TransferService.createNull(ServiceReachable.Yes, ServiceReachable.Yes);
        //
        // const transferResult = await service.transferAasWithSubmodels(aas, [nameplate, technical], apikey);
        //
        // expect(transferResult).length(5);
    });

    it('Cannot reach aas repository service', function () {
        // Should not copy anything
    });

    it('Cannot reach Discovery service', function () {
        // Should copy submodels, repository and registry; error on discovery
    });

    it('Cannot reach Registry service', function () {
        // Should copy submodels, repository and discovery; error on registry
    });

    it('Cannot reach submodel repository service', function () {
        // Should copy AAS in repo, registry, discovery; submodels fail in repo AND registry
    });

    it('Not all submodels are selected for copying', function () {
        // Should only put selected submodels and data into aas submodel properties; rest should not be in return list
    });

    it('No submodels are selected for copying', function () {
        // aas submodel properties should be null
    });

    it('AAS repository url point to another service', function () {
        // Should not copy anything
    });

    it('AAS registry url point to another service', function () {
        // Should copy everything but registry
    });

    it('Discovery url point to another service', function () {
        // Should copy everything but discovery
    });

    it('Submodel repository url point to another service', function () {
        // Should not copy submodel; rest ok
    });

    it('Submodel registry url point to another service', function () {
        // Should copy submodel and aas; error for submodel registry
    });

    it('The target aas already exists in repo', function () {
        // error for repository, rest error because aas not copied
    });

    it('The target aas already exists in registry', function () {
        // error for aas registry only
    });

    it('The target aas already exists in discovery', function () {
        // error for discovery only
    });

    it('The target submodel already exists in repo', function () {
        // error for repository and registry of submodel
    });

    it('The target submodel already exists in registry', function () {
        // error for registry of submodel
    });
});
