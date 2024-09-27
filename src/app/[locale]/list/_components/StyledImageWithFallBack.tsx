import { Skeleton, styled } from '@mui/material';
import React, { useState } from 'react';
import DefaultThumbnail from 'assets/AasDefaultThumbnail.svg';

interface StyledImageProps {
    size: number;
}

const StyledImage = styled('img')<StyledImageProps>(({ size }) => ({
    height: size,
    maxWidth: size,
    width: '100%',
    objectFit: 'scale-down',
}));

type StyledImageWithFallBackProps = {
    src: string | undefined;
    alt: string;
    size: number;
    onClickHandler?: () => void;
};

export const ImageWithFallback = (props: StyledImageWithFallBackProps) => {
    const { src, alt, size, onClickHandler } = props;
    const [hasError, setHasError] = useState(false);
    const [isLoading, setLoading] = useState(true);

    const setErrorOccurred = () => {
        console.log("error ")
        setHasError(true);
    }

    const setLoadingFinished = () => {
        console.log(" loaded")
        setLoading(false);
    }

    const ImageContent = (
        <StyledImage
            src={src}
            onError={() => {setErrorOccurred()}}
            onLoad={() => setLoadingFinished}
            alt={alt}
            size={size}
            onClick={() => onClickHandler?.call(this)}
            style={{ cursor: onClickHandler ? 'pointer' : 'auto' }}
        />
    );

    const LoadingContent = (
        <Skeleton
            variant="rectangular"
            sx={{ position: 'absolute', bottom: '0', right: '0', height: size, maxWidth: size }}
        />
    );

    const FallbackContent = (
        <DefaultThumbnail
            style={{
                maxHeight: size,
                maxWidth: size,
                width: '100%',
                cursor: onClickHandler ? 'pointer' : 'auto',
            }}
            alt={alt}
            onClick={() => onClickHandler?.call(this)}
        />
    );

    console.log("prrgrtzrhtrhops.src:  " + props.src + " err: " + hasError)
    return (
        <>
            {!hasError && (props.src !== undefined) ? (
                <div style={{ position: 'relative', height: size, maxWidth: size, }}>
                    { ImageContent }
                    {isLoading ?? <>{ LoadingContent }</>}
                </div>
            ) : (
                { FallbackContent }
            )}
        </>
    );
};
