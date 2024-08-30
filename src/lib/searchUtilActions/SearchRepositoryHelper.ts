import { getConnectionDataByTypeAction } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';

export async function getAasFromAllRepos(aasId: string, repositoryClient: AssetAdministrationShellRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    for (const url of basePathUrls) {
        const aas = await repositoryClient.getAssetAdministrationShellById(aasId, undefined, url);
        if (aas) {
            return aas;
        }
    }

    throw new Error('AAS not found');
}

export async function getSubmodelFromAllRepos(submodelId: string, repositoryClient: SubmodelRepositoryApi) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    for (const url of basePathUrls) {
        const submodel = await repositoryClient.getSubmodelById(submodelId, undefined, url);
        if (submodel) {
            return submodel;
        }
    }
    throw new Error('Submodel not found');
}

export async function getAasThumbnailFromAllRepos(
    aasId: string,
    repositoryClient: AssetAdministrationShellRepositoryApi,
) {
    const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

    for (const url of basePathUrls) {
        const image = await repositoryClient.getThumbnailFromShell(aasId, undefined, url);
        if (image.size != 0) {
            return image;
        }
    }
    throw new Error('Image not found');
}
