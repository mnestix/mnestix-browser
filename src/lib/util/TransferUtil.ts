import { AssetAdministrationShell, AssetKind, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { encodeBase64 } from 'lib/util/Base64Util';
import { isValidUrl } from 'lib/util/UrlUtil';
import { AssetAdministrationShellDescriptor, Endpoint, SubmodelDescriptor } from 'lib/types/registryServiceTypes';

export function getEndpointUrl(target: AssetAdministrationShell | Submodel, targetBaseUrl: string) {
    const subpath = target instanceof AssetAdministrationShell ? 'shells' : 'submodels';
    return new URL(`${subpath}/${encodeBase64(target.id)}`, targetBaseUrl);
}

export function createEndpointForDescriptor(target: AssetAdministrationShell | Submodel, baseUrl: string): Endpoint {
    const targetEndpointUrl = getEndpointUrl(target, baseUrl);
    return {
        interface: getInterfaceString(target),
        protocolInformation: {
            endpointProtocol: 'HTTP',
            endpointProtocolVersion: ['1.1'],
            href: targetEndpointUrl.toString(),
            // securityAttributes: '',
            // subprotocol: ,
            // subprotocolBody,
            // subprotocolBodyEncoding,
        },
    };
}

export function createShellDescriptorFromAas(
    aas: AssetAdministrationShell,
    targetBaseUrl: string,
    submodelDescriptors?: SubmodelDescriptor[],
): AssetAdministrationShellDescriptor {
    const endpoint = createEndpointForDescriptor(aas, targetBaseUrl);
    return {
        id: aas.id,
        idShort: aas.idShort || undefined,
        description: aas.description || undefined,
        displayName: aas.displayName || undefined,
        extensions: aas.extensions || undefined,
        administration: aas.administration || undefined,
        assetKind: AssetKind[aas.assetInformation.assetKind] as 'Instance' | 'NotApplicable' | 'Type',
        assetType: aas.assetInformation.assetType || undefined,
        globalAssetId: aas.assetInformation.globalAssetId || undefined,
        endpoints: [endpoint],
        specificAssetIds: aas.assetInformation.specificAssetIds || undefined,
        submodelDescriptors: submodelDescriptors,
    };
}

export function createSubmodelDescriptorFromSubmodel(submodel: Submodel, targetBaseUrl: string): SubmodelDescriptor {
    const endpoint = createEndpointForDescriptor(submodel, targetBaseUrl);
    return {
        id: submodel.id,
        idShort: submodel.idShort || undefined,
        semanticId: submodel.semanticId == null ? undefined : submodel.semanticId,
        description: submodel.description || undefined,
        displayName: submodel.displayName || undefined,
        extensions: submodel.extensions || undefined,
        administration: submodel.administration || undefined,
        endpoints: [endpoint],
        supplementalSemanticId: submodel.supplementalSemanticIds == null ? undefined : submodel.supplementalSemanticIds,
    };
}

export function getInterfaceString(target: AssetAdministrationShell | Submodel): string {
    return target instanceof AssetAdministrationShell ? 'AAS-3.0' : 'SUBMODEL-3.0';
}

export function aasThumbnailImageIsFile(aas: AssetAdministrationShell): boolean {
    const thumbnailPath = aas.assetInformation.defaultThumbnail?.path;
    return !!(thumbnailPath && !isValidUrl(thumbnailPath));
}
