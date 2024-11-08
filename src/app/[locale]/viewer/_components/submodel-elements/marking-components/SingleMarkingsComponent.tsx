import { Box, styled, Typography } from '@mui/material';
import { File, Property } from '@aas-core-works/aas-core3.0-typescript/types';
import { useState } from 'react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { isValidUrl } from 'lib/util/UrlUtil';
import { getAttachmentFromSubmodelElement } from 'lib/services/repository-access/repositorySearchActions';
import { base64ToBlob } from 'lib/util/Base64Util';
import { isSuccessWithFile } from 'lib/util/apiResponseWrapper/apiResponseWrapperUtil';
import { useAasOriginSourceState } from 'components/contexts/CurrentAasContext';

type SingleMarkingsComponentProps = {
    readonly file?: File;
    readonly name?: Property;
    readonly additionalText?: Property;
    readonly submodelId?: string;
    readonly idShortPath?: string;
};

const StyledFileImg = styled('img')(({ theme }) => ({
    display: 'block',
    objectFit: 'scale-down',
    objectPosition: 'center',
    width: '100%',
    aspectRatio: '1',
    padding: theme.spacing(1),
}));

const StyledMarkingWrapper = styled(Box)(() => ({
    width: 'calc(25% - 15px)',
    display: 'flex',
    flexDirection: 'column',
    '@media(max-width: 1120px)': {
        width: 'calc(50% - 10px)',
    },
}));

export function SingleMarkingsComponent(props: SingleMarkingsComponentProps) {
    const { file, name, additionalText, submodelId, idShortPath } = props;
    const [markingImage, setMarkingImage] = useState<string>();
    const [aasOriginUrl] = useAasOriginSourceState();

    useAsyncEffect(async () => {
        if (!isValidUrl(file!.value)) {
            const fileIdShort = idShortPath + '.' + file?.idShort;
            const response = await getAttachmentFromSubmodelElement(submodelId!, fileIdShort, aasOriginUrl);
            let image: Blob;
            if (isSuccessWithFile(response)) {
                image = base64ToBlob(response.result, response.fileType);
                setMarkingImage(URL.createObjectURL(image));
            } else {
                console.error('Image not found for file ID: ' + fileIdShort);
            }
        } else {
            if (file?.value) setMarkingImage(file.value);
        }
    }, [props.file]);

    return (
        !!file && (
            <StyledMarkingWrapper sx={{ boxShadow: 2 }}>
                <StyledFileImg src={markingImage} />
                {(!!name || !!additionalText) && (
                    <Box sx={{ backgroundColor: 'grey.200', p: 1, flexGrow: '1' }}>
                        {!!name && <Typography>{name.value}</Typography>}
                        {!!additionalText && (
                            <Typography variant="body2" color="text.secondary">
                                {additionalText.value}
                            </Typography>
                        )}
                    </Box>
                )}
            </StyledMarkingWrapper>
        )
    );
}
