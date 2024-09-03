import { getConnectionDataByTypeAction } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';

export async function getAasFromAllRepos(aasId: string, repositoryClient: AssetAdministrationShellRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    // Erstellen Sie ein Array von Promises mit Fehlerbehandlung
    const promises = basePathUrls.map((url) => repositoryClient.getAssetAdministrationShellById(aasId, undefined, url));

    try {
        // Promise.any wartet auf das erste erfüllte Promise
        return await Promise.any(promises);
    } catch {
        // Falls alle abgelehnt werden, werfen wir einen Fehler
        throw new Error('AAS not found');
    }
}

export async function getSubmodelFromAllRepos(submodelId: string, repositoryClient: SubmodelRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    // Erstellen Sie ein Array von Promises
    const promises = basePathUrls.map((url) => repositoryClient.getSubmodelById(submodelId, undefined, url));

    // Promise.any wartet auf den ersten erfüllten Promise
    try {
        return await Promise.any(promises);
    } catch (error) {
        // Falls alle abgelehnt werden, werfen wir einen Fehler
        throw new Error('Submodel not found');
    }
}

export async function getAasThumbnailFromAllRepos(
    aasId: string,
    repositoryClient: AssetAdministrationShellRepositoryApi,
) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    // Erstellen Sie ein Array von Promises mit Fehlerbehandlung
    const promises = basePathUrls.map((url) =>
        repositoryClient.getThumbnailFromShell(aasId, undefined, url).then((image) => {
            if (image.size === 0) {
                throw new Error('Empty image');
            }
            return image;
        }),
    );

    try {
        // Promise.any wartet auf das erste erfüllte Promise
        return await Promise.any(promises);
    } catch {
        // Falls alle abgelehnt werden, werfen wir einen Fehler
        throw new Error('Image not found');
    }
}
