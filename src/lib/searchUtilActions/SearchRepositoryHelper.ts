import { getConnectionDataByTypeAction } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';

export async function getAasFromAllRepos(aasId: string, repositoryClient: AssetAdministrationShellRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    const promises = basePathUrls.map((url) => repositoryClient.getAssetAdministrationShellById(aasId, undefined, url));

    try {
        return await Promise.any(promises);
    } catch {
        throw new Error('AAS not found');
    }
}

export async function getSubmodelFromAllRepos(submodelId: string, repositoryClient: SubmodelRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    const promises = basePathUrls.map((url) => repositoryClient.getSubmodelById(submodelId, undefined, url));

    try {
        return await Promise.any(promises);
    } catch (error) {
        throw new Error('Submodel not found');
    }
}

export async function getAasThumbnailFromAllRepos(
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
        throw new Error('Image not found');
    }
}
