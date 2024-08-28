import { InfoOutlined, InsertDriveFileOutlined, OpenInNew } from '@mui/icons-material';
import { Box, Button, IconButton, Link, styled, Typography } from '@mui/material';
import {
    MultiLanguageProperty,
    Property,
    ISubmodelElement,
    SubmodelElementCollection,
    File,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { DataRow } from 'components/basics/DataRow';
import { PdfDocumentIcon } from 'components/custom-icons/PdfDocumentIcon';
import { messages } from 'lib/i18n/localization';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getTranslationText, hasSemanticId } from 'lib/util/SubmodelResolverUtil';
import { DocumentDetailsDialog } from './DocumentDetailsDialog';
import { isValidUrl } from 'lib/util/UrlUtil';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import Image from 'next/image';
import { SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';

enum DocumentSpecificSemanticId {
    DocumentVersion = 'https://admin-shell.io/vdi/2770/1/0/DocumentVersion',
    Title = 'https://admin-shell.io/vdi/2770/1/0/DocumentDescription/Title',
    OrganizationName = 'https://admin-shell.io/vdi/2770/1/0/Organization/OrganizationName',
    DigitalFile = 'https://admin-shell.io/vdi/2770/1/0/StoredDocumentRepresentation/DigitalFile',
    PreviewFile = 'https://admin-shell.io/vdi/2770/1/0/StoredDocumentRepresentation/PreviewFile',
}

enum DocumentSpecificSemanticIdIrdi {
    DocumentVersion = '0173-1#02-ABI503#001/0173-1#01-AHF582#001',
    Title = '0173-1#02-AAO105#002',
    OrganizationName = '0173-1#02-ABI002#001',
    DigitalFile = '0173-1#02-ABI504#001/0173-1#01-AHF583#001',
    PreviewFile = '0173-1#02-ABI505#001/0173-1#01-AHF584#001',
}

enum DocumentSpecificSemanticIdV2 {
    DocumentVersion = 'https://admin-shell.io/vdi/2770/1/0/DocumentVersion',
    Title = 'https://admin-shell.io/vdi/2770/1/0/DocumentDescription/Title',
    OrganizationShortName = 'https://admin-shell.io/vdi/2770/1/0/Organization/OrganizationName',
    DigitalFile = 'https://admin-shell.io/vdi/2770/1/0/StoredDocumentRepresentation/DigitalFile',
    PreviewFile = 'https://admin-shell.io/vdi/2770/1/0/StoredDocumentRepresentation/PreviewFile',
}

enum DocumentSpecificSemanticIdIrdiV2 {
    DocumentVersion = '0173-1#02-ABI503#003/0173-1#01-AHF582#003',
    Title = '0173-1#02-ABG940#004',
    OrganizationShortName = '0173-1#02-ABI002#003',
    DigitalFile = '0173-1#02-ABK126#003',
    PreviewFile = '0173-1#02-ABK127#002',
}

type MarkingsComponentProps = {
    readonly submodelElement?: SubmodelElementCollection;
    readonly hasDivider?: boolean;
    readonly submodelId?: string;
};

type FileViewObject = {
    mimeType: string;
    title: string;
    url: string;
    previewImgUrl: string;
    organizationName: string;
};

const StyledImageWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 90,
    width: 90,
    boxShadow: theme.shadows['3'],
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(2),
    img: {
        objectFit: 'contain',
        width: '100%',
        height: '100%',
    },
    '.MuiSvgIcon-root': {
        fontSize: '2.5rem',
        opacity: '.5',
    },
}));

export function DocumentComponent(props: MarkingsComponentProps) {
    const intl = useIntl();
    const [fileViewObject, setFileViewObject] = useState<FileViewObject>();
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const { submodelClient } = useApis();

    useAsyncEffect(async () => {
        setFileViewObject(await getFileViewObject(submodelClient));
    }, [props.submodelElement]);

    const handleDetailsClick = () => {
        setDetailsModalOpen(true);
    };

    const handleDetailsModalClose = () => {
        setDetailsModalOpen(false);
    };

    function findIdShortForLatestElement(
        submodelElement: SubmodelElementCollection,
        prefix: string,
        id: string,
    ): string {
        const found_files = submodelElement.value
            ?.filter(
                (element) =>
                    element && element.idShort && (hasSemanticId(element, id) || element.idShort.startsWith(prefix)),
            )
            .map((value) => value.idShort)
            .sort()
            .reverse()
            .filter((value) => value != null);

        if (found_files === undefined || found_files.length < 1) {
            console.error('Did not find a digital File');
            return 'DigitalFile';
        }

        // This is here just to satisfy typescript as we filter the list above for null values, this cannot be null but typescript says it can be...
        const returner = found_files[0];
        if (returner == null) {
            console.error('Did not find a digital File');
            return 'DigitalFile';
        }
        if (found_files.length > 1) {
            console.warn(
                `Found multiple versions of documents: ${found_files}, displaying the last one when sorted alphabetically: ${returner}`,
            );
        }
        return returner;
    }

    function findIdShortForLatestDocument(submodelElement: SubmodelElementCollection) {
        return findIdShortForLatestElement(submodelElement, 'DigitalFile', DocumentSpecificSemanticIdIrdi.File);
    }

    function findIdShortForLatestPreviewImage(submodelElement: SubmodelElementCollection) {
        return findIdShortForLatestElement(submodelElement, 'PreviewFile', DocumentSpecificSemanticIdIrdi.PreviewFile);
    }

    async function getFileViewObject(submodelClient: SubmodelRepositoryApi): Promise<FileViewObject> {
        let mimeType = '';
        let url = '';
        let title = props.submodelElement?.idShort || '';
        let previewImgUrl = '';
        let organizationName = '';

        if (props.submodelElement?.value) {
            for (const smEl of props.submodelElement.value) {
                // check for DocumentVersions
                if (
                    hasSemanticId(smEl, DocumentSpecificSemanticId.DocumentVersion) ||
                    hasSemanticId(smEl, DocumentSpecificSemanticIdIrdi.DocumentVersion)
                ) {
                    const coll = smEl as SubmodelElementCollection;
                    if (coll.value) {
                        for (const versionEl of Array.isArray(coll.value) ? coll.value : Object.values(coll.value)) {
                            const versionSubmodelEl = versionEl as ISubmodelElement;
                            // title
                            if (
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticId.Title) ||
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticIdIrdi.Title)
                            ) {
                                title = getTranslationText(versionSubmodelEl as MultiLanguageProperty, intl);
                                continue;
                            }
                            // file
                            if (
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticId.File) ||
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticIdIrdi.File)
                            ) {
                                if (isValidUrl((versionSubmodelEl as File).value)) {
                                    url = (versionSubmodelEl as File).value || '';
                                    mimeType = (versionSubmodelEl as File).contentType;
                                } else if (props.submodelId && smEl.idShort && props.submodelElement?.idShort) {
                                    const submodelElementPath =
                                        props.submodelElement.idShort +
                                        '.' +
                                        smEl.idShort +
                                        '.' +
                                        findIdShortForLatestDocument(smEl as SubmodelElementCollection);
                                    url =
                                        '/repo/submodels/' +
                                        encodeBase64(props.submodelId) +
                                        '/submodel-elements/' +
                                        submodelElementPath +
                                        '/attachment';
                                    mimeType = (versionSubmodelEl as File).contentType;

                                    try {
                                        const image = await submodelClient.getAttachmentFromSubmodelElement(
                                            props.submodelId,
                                            submodelElementPath,
                                        );
                                        url = URL.createObjectURL(image);
                                        mimeType = (versionSubmodelEl as File).contentType;
                                    } catch (e) {
                                        console.error('Image not found', e);
                                    }
                                }

                                continue;
                            }
                            // preview
                            if (
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticId.PreviewFile) ||
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticIdIrdi.PreviewFile)
                            ) {
                                if (isValidUrl((versionSubmodelEl as File).value)) {
                                    previewImgUrl = (versionSubmodelEl as File).value || '';
                                } else if (props.submodelId && smEl.idShort && props.submodelElement?.idShort) {
                                    const submodelElementPath =
                                        props.submodelElement.idShort +
                                        '.' +
                                        smEl.idShort +
                                        '.' +
                                        findIdShortForLatestPreviewImage(smEl as SubmodelElementCollection);
                                    previewImgUrl =
                                        '/repo/submodels/' +
                                        encodeBase64(props.submodelId) +
                                        '/submodel-elements/' +
                                        submodelElementPath +
                                        '/attachment';

                                    try {
                                        const image = await submodelClient.getAttachmentFromSubmodelElement(
                                            props.submodelId,
                                            submodelElementPath,
                                        );
                                        previewImgUrl = URL.createObjectURL(image);
                                    } catch (e) {
                                        console.error('Image not found', e);
                                    }
                                }
                                continue;
                            }
                            // organization name
                            if (
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticId.OrganizationName) ||
                                hasSemanticId(versionSubmodelEl, DocumentSpecificSemanticIdIrdi.OrganizationName)
                            ) {
                                organizationName = (versionSubmodelEl as Property).value || '';
                            }
                        }
                    }
                }
            }
        }
        return {
            mimeType,
            url,
            title,
            previewImgUrl,
            organizationName,
        };
    }

    return (
        <DataRow title={props.submodelElement?.idShort} hasDivider={props.hasDivider}>
            {fileViewObject && (
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Box display="flex">
                        <Link href={fileViewObject!.url} target="_blank">
                            <StyledImageWrapper>
                                {fileViewObject!.previewImgUrl ? (
                                    <Image src={fileViewObject!.previewImgUrl} height={90} width={90} alt="Document" />
                                ) : fileViewObject!.mimeType === 'application/pdf' ? (
                                    <PdfDocumentIcon color="primary" />
                                ) : (
                                    <InsertDriveFileOutlined color="primary" />
                                )}
                            </StyledImageWrapper>
                        </Link>
                        <Box>
                            <Typography>{fileViewObject!.title}</Typography>
                            {fileViewObject!.organizationName && (
                                <Typography variant="body2" color="text.secondary">
                                    {fileViewObject!.organizationName}
                                </Typography>
                            )}
                            <Button
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                sx={{ mt: 1 }}
                                href={fileViewObject!.url}
                                target="_blank"
                            >
                                <FormattedMessage {...messages.mnestix.open} />
                            </Button>
                        </Box>
                    </Box>
                    <IconButton onClick={() => handleDetailsClick()} sx={{ ml: 1 }}>
                        <InfoOutlined />
                    </IconButton>
                </Box>
            )}
            <DocumentDetailsDialog
                open={detailsModalOpen}
                handleClose={() => handleDetailsModalClose()}
                document={props.submodelElement as SubmodelElementCollection}
            />
        </DataRow>
    );
}
