import { getConnectionDataByTypeAction } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { NotFoundError } from 'lib/errors/NotFoundError';

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};

export async function getAasFromAllAasRepos(
    aasId: string,
    repositoryClient: AssetAdministrationShellRepositoryApi,
): Promise<RepoSearchResult[]> {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    const promises = basePathUrls.map(
        (url) =>
            repositoryClient
                .getAssetAdministrationShellById(aasId, undefined, url)
                .then((aas) => ({ aas: aas, location: url })), // add the URL to the resolved value
    );

    const results = await Promise.allSettled(promises);
    const fulfilledResults = results.filter(result => result.status === 'fulfilled');

    if (fulfilledResults.length > 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return fulfilledResults.map(result => (result as unknown).value);
    } else {
        throw new NotFoundError('AAS not found');
    }
}

export async function getSubmodelFromAllSubmodelRepos(submodelId: string, repositoryClient: SubmodelRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '2', typeName: 'SUBMODEL_REPOSITORY' });

    const promises = basePathUrls.map((url) => repositoryClient.getSubmodelById(submodelId, undefined, url));

    try {
        return await Promise.any(promises);
    } catch (error) {
        throw new NotFoundError('Submodel not found');
    }
}

export async function getAasThumbnailFromAllAasRepos(
    aasId: string,
    repositoryClient: AssetAdministrationShellRepositoryApi,
) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    const promises = basePathUrls.map((url) =>
        repositoryClient.getThumbnailFromShell(aasId, undefined, url).then((image) => {
            if (image.size === 0) {
                throw new Error('Empty image');
            }
            return image;
        }),
    );

    try {
        return await Promise.any(promises);
    } catch {
        throw new NotFoundError('Image not found');
    }
}
