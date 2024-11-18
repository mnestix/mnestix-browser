import { expect } from '@jest/globals';
import { ServiceReachable, TransferService } from 'lib/services/transfer-service/TransferService';
import testData from './TransferService.data.json';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { createShellDescriptorFromAas, createSubmodelDescriptorFromSubmodel } from 'lib/util/TransferUtil';
import { TransferAas, TransferResult, TransferSubmodel } from 'lib/types/TransferServiceData';

const aas = testData.transferAas as unknown as AssetAdministrationShell;
const transferAas = { aas: aas, originalAasId: aas.id } as TransferAas;
const nameplate = testData.transferSubmodelNameplate as unknown as Submodel;
const transferNameplate = { submodel: nameplate, originalSubmodelId: nameplate.id } as TransferSubmodel;
const technical = testData.transferSubmodelTechnicalData as unknown as Submodel;
const transferTechnical = { submodel: technical, originalSubmodelId: technical.id } as TransferSubmodel;

const checkNthBinaryDigit = (number: number, digit: number) => ((number >>> digit) & 1) == 1;

function expectTransferResult(result: TransferResult[], successMask: number = 0xffff) {
    result.forEach((value, index) => {
        const expected = checkNthBinaryDigit(successMask, result.length - index - 1);
        expect(value.success).toBe(expected);
    });
}

describe('TransferService: Export AAS', function () {
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

        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // Should include AAS repo, registry, thumbnail, discovery; submodel repo, registry, file
        expect(transferResult).toHaveLength(7);

        // Should return results in a fixed order
        expect(transferResult[0].operationKind).toBe('AasRepository');
        expect(transferResult[1].operationKind).toBe('Discovery');
        expect(transferResult[2].operationKind).toBe('AasRegistry');
        expect(transferResult[3].operationKind).toBe('SubmodelRepository');
        expect(transferResult[4].operationKind).toBe('SubmodelRepository');
        expect(transferResult[5].operationKind).toBe('SubmodelRegistry');
        expect(transferResult[6].operationKind).toBe('SubmodelRegistry');
    });

    it('Only repositories given', async () => {
        const service = TransferService.createNull(
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [aas],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [nameplate, technical],
        );

        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // Should have no errors; registries and discovery not in return list
        expect(transferResult).toHaveLength(3);
        expectTransferResult(transferResult, 0b111);
    });

    it('Cannot reach aas repository service', async function () {
        const service = TransferService.createNull(
            ServiceReachable.No,
            ServiceReachable.Yes,
            [aas],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [nameplate, technical],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            ServiceReachable.Yes,
        );

        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // Should not copy anything
        expectTransferResult(transferResult, 0b0);
    });

    it('Cannot reach Discovery service', async function () {
        const service = TransferService.createNull(
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [aas],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [nameplate, technical],
            ServiceReachable.No,
            ServiceReachable.Yes,
            ServiceReachable.Yes,
        );

        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // Should copy submodels, repository and registry; error on discovery
        const discoveryResult = transferResult.find((value) => value.operationKind == 'Discovery');
        expect(discoveryResult).not.toBeUndefined();
        expect(!discoveryResult!.success).toBe(true);
        expectTransferResult(transferResult, 0b1011111);
    });

    it('Cannot reach AAS Registry service', async function () {
        const service = TransferService.createNull(
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [aas],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [nameplate, technical],
            ServiceReachable.Yes,
            ServiceReachable.No,
            ServiceReachable.Yes,
        );

        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // Should copy submodels, repository and discovery; error on registry
        const discoveryResults = transferResult.filter((value) => value.operationKind == 'AasRegistry');
        expect(discoveryResults).toHaveLength(1);
        expect(discoveryResults[0].success).toBe(false);
        expectTransferResult(transferResult, 0b1101111);
    });

    it('Cannot reach submodel repository service', async function () {
        const service = TransferService.createNull(
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            [aas],
            ServiceReachable.No,
            ServiceReachable.Yes,
            [nameplate, technical],
            ServiceReachable.Yes,
            ServiceReachable.Yes,
            ServiceReachable.Yes,
        );

        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // Should copy AAS in repo, registry, discovery; submodels fail in repo AND registry
        expectTransferResult(transferResult, 0b1110000);
    });

    it('Not all submodels are selected for copying', async function () {
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

        await service.transferAasWithSubmodels(transferAas, [transferNameplate]);

        // Should only put selected submodels and data into aas submodel properties; rest should not be in return list
        const targetSubmodelRepo = service.targetSubmodelRepositoryClient;
        expect(targetSubmodelRepo.getSubmodelById(nameplate.id)).toBeTruthy();
        expect(targetSubmodelRepo.getSubmodelById(technical.id)).toBeUndefined();

        const targetSubmodels = (await service.targetAasRepositoryClient.getAssetAdministrationShellById(aas.id)).result
            ?.submodels;
        expect(targetSubmodels).toHaveLength(1);
        expect(targetSubmodels![0].keys[0].value).toBe(nameplate.id);
    });

    it('No submodels are selected for copying', async function () {
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

        await service.transferAasWithSubmodels(transferAas, []);

        // aas submodel properties should be null
        const targetSubmodelRepo = service.targetSubmodelRepositoryClient;
        expect(targetSubmodelRepo.getSubmodelById(nameplate.id)).toBeUndefined();
        expect(targetSubmodelRepo.getSubmodelById(technical.id)).toBeUndefined();

        const targetAas = (await service.targetAasRepositoryClient.getAssetAdministrationShellById(aas.id)).result!;
        const targetSubmodels = targetAas.submodels; // TODO is an empty list
        expect(targetSubmodels).toBeUndefined();
    });

    it('The target aas already exists in repo', async function () {
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

        await service.targetAasRepositoryClient.postAssetAdministrationShell(aas);
        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // error for repository, rest error because aas not copied
        expectTransferResult(transferResult, 0b0);
    });

    it('The target aas already exists in registry', async function () {
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

        const shellDescriptor = createShellDescriptorFromAas(aas, service.targetSubmodelRepositoryClient?.getBaseUrl());
        await service.targetAasRegistryClient!.postAssetAdministrationShellDescriptor(shellDescriptor);
        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // error for aas registry only
        expectTransferResult(transferResult, 0b1101111);
    });

    it('The target aas already exists in discovery', async function () {
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

        await service.targetAasDiscoveryClient!.linkAasIdAndAssetId(aas.id, aas.assetInformation.globalAssetId!);
        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // error for discovery only
        expectTransferResult(transferResult, 0b1011111);
    });

    it('The target submodel already exists in repo', async function () {
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

        await service.targetSubmodelRepositoryClient.postSubmodel(nameplate);
        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // error for repository and registry of submodel
        expectTransferResult(transferResult, 0b1110101);
    });

    it('The target submodel already exists in registry', async function () {
        // error for registry of submodel
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

        const submodelDescriptor = createSubmodelDescriptorFromSubmodel(
            nameplate,
            service.targetAasRepositoryClient.getBaseUrl(),
        );
        await service.targetSubmodelRegistryClient!.postSubmodelDescriptor(submodelDescriptor);
        const transferResult = await service.transferAasWithSubmodels(transferAas, [
            transferNameplate,
            transferTechnical,
        ]);

        // error for repository and registry of submodel
        expectTransferResult(transferResult, 0b1111101);
    });
});
